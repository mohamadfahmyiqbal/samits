// Main server entry point
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import winston from "winston";
import { Server as SocketIOServer } from "socket.io";
import { initializeDB } from "./models/index.js";
import { configureApp } from "./config/app.js";
import mainRoutes from "./routes/index.js";
import { setSocketServer } from "./services/realtime.service.js";
import express from "express"; // Added missing import statement

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
const useSSL = process.env.USE_SSL === "true";
let httpServer = null;
let ioServer = null;

// Configure Express app
const { loginLimiter, pushLimiter } = configureApp(app);

// SSL Configuration
let sslOptions = null;
if (useSSL) {
  try {
    sslOptions = {
      key: fs.readFileSync(path.join(__dirname, "cert", "localhost.key")),
      cert: fs.readFileSync(path.join(__dirname, "cert", "localhost.crt")),
    };
    logger.info("✅ SSL certificates loaded successfully");
  } catch (error) {
    logger.warn("⚠️ SSL certificates not found, falling back to HTTP");
    useSSL = false;
  }
}

// CORS origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
];

// Socket.IO token verification
const verifySocketToken = (token, callback) => {
  if (!token) {
    return callback(new Error("Token tidak ada"));
  }

  // Add your JWT verification logic here
  // For now, we'll accept the token
  return callback(null, true);
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

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDB();

    // Apply rate limiters and routes
    app.use("/api/users/login", loginLimiter);
    app.use("/api/push/subscribe", pushLimiter);
    app.use("/api/push/send", pushLimiter);
    app.use("/api", mainRoutes);

    // Create server
    if (useSSL && sslOptions) {
      httpServer = https.createServer(sslOptions, app);
      logger.info(`HTTPS Server running at https://localhost:${port}`);
    } else {
      httpServer = http.createServer(app);
      logger.info(`HTTP Server running at http://localhost:${port}`);
    }

    // Setup Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    ioServer = io;
    setSocketServer(io);

    // Socket.IO authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      verifySocketToken(token, (err, success) => {
        if (err || !success) {
          return next(new Error("Authentication failed"));
        }
        socket.userId = "user_id_from_token"; // Extract from token
        next();
      });
    });

    io.on("connection", (socket) => {
      logger.info(`User connected: ${socket.userId}`);

      socket.on("disconnect", () => {
        logger.info(`User disconnected: ${socket.userId}`);
      });
    });

    // Start listening
    httpServer.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
