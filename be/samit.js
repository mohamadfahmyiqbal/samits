// samit.js (FINAL)
import https from "https";
import http from "http";
import fs from "fs";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import winston from "winston";
import { initializeDB } from "./models/index.js"; // Import initializeDB
import mainRoutes from "./routes/index.js";
import { verifyToken } from "./utils/jwtHelper.js";
import { setSocketServer } from "./services/realtime.service.js";
import { fileURLToPath } from "url";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup Winston Logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "samit-backend" },
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

const app = express();
const port = process.env.PORT || 5002;
let ioServer = null;
let httpServer = null;

// --- SSL/HTTP Config ---
const useSSL = process.env.USE_SSL === "true";
const sslKeyPath = "./cert/localhost.key";
const sslCertPath = "./cert/localhost.crt";
const sslCaPath = process.env.SSL_CA_PATH || "./cert/ca.cer";

let sslOptions = null;

if (useSSL) {
  if (!fs.existsSync(sslKeyPath) || !fs.existsSync(sslCertPath)) {
    logger.error("Sertifikat SSL tidak ditemukan.");
    process.exit(1);
  }

  sslOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
    rejectUnauthorized: process.env.NODE_ENV === "production", // Secure in production
    minVersion: "TLSv1.2", // Enforce minimum TLS version
    honorCipherOrder: true,
  };

  if (fs.existsSync(sslCaPath)) {
    sslOptions.ca = fs.readFileSync(sslCaPath);
  }
}

// --- Middleware ---
const fallbackOrigins = [
  "http://localhost:3000", // For development
  "https://localhost:3000", // For development with HTTPS
  "http://localhost:5002", // Backend development
  "https://localhost:5002", // Backend development with HTTPS
  "http://pik1com074.local.ikoito.co.id:3000",
  "https://pik1com074.local.ikoito.co.id:3000",
  "http://pik1com074.local.ikoito.co.id:3001",
  "https://pik1com074.local.ikoito.co.id:3001",
  "https://pik1com074.local.ikoito.co.id:5008",
  "https://pik1com074.local.ikoito.co.id:5005",
  "https://pik1svr008.local.ikoito.co.id:449",
  "https://pik1com012:3000",
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const finalAllowedOrigins =
  allowedOrigins.length > 0 ? allowedOrigins : fallbackOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || finalAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new Error(`Origin tidak diizinkan oleh CORS: ${origin}`),
      false,
    );
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use((err, _req, res, next) => {
  if (err?.message?.startsWith("Origin tidak diizinkan oleh CORS:")) {
    return res.status(403).json({ message: err.message });
  }
  return next(err);
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "andan",
    resave: false,
    saveUninitialized: false, // Fix: Don't save uninitialized sessions
    cookie: {
      secure: useSSL, // Only secure if SSL is enabled
      httpOnly: true,
      sameSite: useSSL ? "none" : "lax", // Dynamic based on SSL
      maxAge: 60 * 60 * 1000, // 1 jam
    },
    name: "samit.sid", // Custom session name
  }),
);

app.use(cookieParser());

app.use(express.json({ limit: "10mb" })); // Add limit to prevent DoS
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.",
  },
});

const pushRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Terlalu banyak request push. Coba lagi nanti." },
});

const getSocketAuthErrorMessage = (error) => {
  if (error?.name === "TokenExpiredError") {
    return "Token socket kadaluarsa. Silakan login ulang.";
  }
  if (error?.name === "JsonWebTokenError") {
    return "Token socket tidak valid.";
  }
  return "Token socket tidak valid atau kadaluarsa.";
};

const gracefulShutdown = () => {
  logger.info("Menutup server dengan aman...");
  if (ioServer) {
    ioServer.close();
  }
  if (httpServer) {
    httpServer.close(() => {
      logger.info("HTTP/Socket server berhenti.");
      process.exit(0);
    });
    return;
  }
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// --- Fungsi Asinkron untuk memulai Server ---
async function startServer() {
  try {
    // PENTING: TUNGGU inisialisasi database sebelum melanjutkan
    await initializeDB();

    // Routing (ditempatkan di sini setelah DB siap)
    app.use("/api/users/login", loginRateLimiter);
    app.use("/api/push/subscribe", pushRateLimiter);
    app.use("/api/push/send", pushRateLimiter);
    app.use("/api", mainRoutes);

    // Jalankan server HTTP atau HTTPS
    if (useSSL && sslOptions) {
      httpServer = https.createServer(sslOptions, app);
      logger.info(`HTTPS Server running at https://localhost:${port}`);
    } else {
      httpServer = http.createServer(app);
      logger.info(`HTTP Server running at http://localhost:${port}`);
    }

    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: finalAllowedOrigins,
        credentials: true,
      },
    });
    ioServer = io;

    io.use((socket, next) => {
      try {
        const authHeader = socket.handshake.headers?.authorization || "";
        const bearerToken = authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : null;
        const token = socket.handshake.auth?.token || bearerToken;

        if (!token) {
          return next(new Error("Token tidak ditemukan untuk koneksi socket."));
        }

        socket.user = verifyToken(token);
        return next();
      } catch (error) {
        return next(new Error(getSocketAuthErrorMessage(error)));
      }
    });

    io.on("connection", (socket) => {
      const nik = socket.user?.nik;
      if (nik) {
        socket.join(`user:${nik}`);
      }

      socket.emit("socket:ready", {
        connected: true,
        serverTime: new Date().toISOString(),
        user: {
          nik: socket.user?.nik || null,
          position: socket.user?.position || null,
        },
      });

      socket.on("client:ping", () => {
        socket.emit("server:pong", { at: new Date().toISOString() });
      });

      socket.on("disconnect", (reason) => {
        logger.info(
          `Socket disconnect [${socket.id}] nik=${nik || "-"} reason=${reason}`,
        );

        // Clean up room membership
        if (nik) {
          socket.leave(`user:${nik}`);
        }
      });
    });

    setSocketServer(io);

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        ssl: useSSL,
        database: "connected",
      });
    });

    httpServer.listen(port, "0.0.0.0", () => {
      const protocol = useSSL ? "https" : "http";
      logger.info(
        `${protocol.toUpperCase()} Server running at ${protocol}://localhost:${port}`,
      );
    });
  } catch (error) {
    logger.error("Gagal menjalankan server atau inisialisasi DB:", error);
    process.exit(1);
  }
}

startServer();
