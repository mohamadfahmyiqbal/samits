// samit.js (FINAL)
import https from "https";
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
import logger from "./utils/logger.js"; // Import centralized logger
import { sslManager } from "./utils/sslManager.js"; // Import centralized SSL manager
import { initializeDB } from "./models/index.js"; // Import initializeDB
import mainRoutes from "./routes/index.js";
import { verifyToken } from "./utils/jwtHelper.js";
import { setSocketServer } from "./services/realtime.service.js";
import { fileURLToPath } from "url";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger is now centralized in utils/logger.js

const app = express();
const port = process.env.PORT || 5002;
let ioServer = null;
let httpServer = null;

// --- SSL Config (Centralized) ---
let sslOptions;
try {
  sslOptions = sslManager.getSSLOptions();
  logger.info("SSL certificates loaded successfully");
} catch (error) {
  logger.error("Failed to load SSL certificates:", error.message);
  process.exit(1);
}

// --- Middleware ---
const fallbackOrigins = [
  "http://localhost:3000",
  "https://localhost:3000",
  "http://localhost:3001",
  "https://localhost:3001",
  "https://localhost:5008",
  "https://localhost:5005",
  "http://127.0.0.1:3000",
  "https://127.0.0.1:3000",
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

// Validate required environment variables
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  logger.error("SESSION_SECRET tidak terdefinisi di environment variables.");
  process.exit(1);
}

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 60 * 60 * 1000, // 1 jam
    },
  }),
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// --- Fungsi Asinkron untuk memulai Server ---
async function startServer() {
  try {
    // PENTING: TUNGGU inisialisasi database sebelum melanjutkan
    await initializeDB();

    // Routing (ditempatkan di sini setelah DB siap)
    console.log("Setting up routes...");
    app.use("/api/users/login", loginRateLimiter);
    app.use("/api/push/subscribe", pushRateLimiter);
    app.use("/api/push/send", pushRateLimiter);
    app.use("/api", mainRoutes);
    console.log("Routes set up complete");

    // Jalankan server HTTPS
    httpServer = https.createServer(sslOptions, app);

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
      });
    });

    setSocketServer(io);

    // Global Error Handler (must be last)
    app.use(errorHandler);

    httpServer
      .listen(port, "0.0.0.0", () => {
        logger.info(`HTTPS Server running at https://localhost:${port}`);
      })
      .on("error", (err) => {
        logger.error("Server error:", err);
        process.exit(1);
      });
  } catch (error) {
    logger.error("Gagal menjalankan server atau inisialisasi DB:", error);
    process.exit(1);
  }
}

startServer();
