// utils/sslManager.js - Centralized SSL Certificate Management
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SSLManager {
  constructor() {
    this.certPaths = {
      key: process.env.SSL_KEY_PATH || "./cert/localhost/localhost.key",
      cert: process.env.SSL_CERT_PATH || "./cert/localhost/localhost.crt",
      ca: process.env.SSL_CA_PATH || "./cert/ca.cer",
    };
  }

  // Check if SSL certificates exist and are valid
  validateCertificates() {
    const missing = [];

    // Check required certificates
    if (!fs.existsSync(this.certPaths.key)) {
      missing.push("SSL private key");
    }

    if (!fs.existsSync(this.certPaths.cert)) {
      missing.push("SSL certificate");
    }

    if (missing.length > 0) {
      const error = `Missing SSL certificates: ${missing.join(", ")}`;
      logger.error(error);
      throw new Error(error);
    }

    // Check optional CA certificate
    const caExists = fs.existsSync(this.certPaths.ca);
    if (caExists) {
      logger.info("CA certificate found and will be used");
    } else {
      logger.warn("CA certificate not found, proceeding without it");
    }

    return true;
  }

  // Get SSL options for HTTPS server
  getSSLOptions() {
    this.validateCertificates();

    const sslOptions = {
      key: fs.readFileSync(this.certPaths.key),
      cert: fs.readFileSync(this.certPaths.cert),
    };

    // Add CA certificate if available
    if (fs.existsSync(this.certPaths.ca)) {
      sslOptions.ca = fs.readFileSync(this.certPaths.ca);
    }

    logger.info("SSL options loaded successfully");
    return sslOptions;
  }

  // Get certificate info (for debugging)
  getCertificateInfo() {
    try {
      const stats = {
        key: fs.existsSync(this.certPaths.key)
          ? fs.statSync(this.certPaths.key)
          : null,
        cert: fs.existsSync(this.certPaths.cert)
          ? fs.statSync(this.certPaths.cert)
          : null,
        ca: fs.existsSync(this.certPaths.ca)
          ? fs.statSync(this.certPaths.ca)
          : null,
      };

      const info = {};
      Object.keys(stats).forEach((key) => {
        if (stats[key]) {
          info[key] = {
            exists: true,
            size: stats[key].size,
            modified: stats[key].mtime.toISOString(),
            path: this.certPaths[key],
          };
        } else {
          info[key] = {
            exists: false,
            path: this.certPaths[key],
          };
        }
      });

      return info;
    } catch (error) {
      logger.error("Error getting certificate info:", error);
      return null;
    }
  }

  // Create certificates directory if it doesn't exist
  ensureCertDirectory() {
    const certDir = path.dirname(this.certPaths.key);
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
      logger.info(`Created SSL certificate directory: ${certDir}`);
    }
  }
}

// Export singleton instance
export const sslManager = new SSLManager();
export default sslManager;
