// utils/sslManager.js - Centralized SSL Certificate Management
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SSLManager {
  constructor() {
    this.defaultPaths = {
      key: "./cert/localhost/localhost.key",
      cert: "./cert/localhost/localhost.crt",
      ca: "./cert/ca.cer",
    };
  }

  get certPaths() {
    return {
      key: process.env.SSL_KEY_PATH || this.defaultPaths.key,
      cert: process.env.SSL_CERT_PATH || this.defaultPaths.cert,
      ca: process.env.SSL_CA_PATH || this.defaultPaths.ca,
    };
  }

  // Check if SSL certificates exist and are valid
  validateCertificates() {
    const paths = this.certPaths;
    const missing = [];

    // Check required certificates
    if (!fs.existsSync(paths.key)) {
      missing.push("SSL private key");
    }

    if (!fs.existsSync(paths.cert)) {
      missing.push("SSL certificate");
    }

    if (missing.length > 0) {
      const error = `Missing SSL certificates: ${missing.join(", ")}`;
      logger.error(error);
      throw new Error(error);
    }

    // Check optional CA certificate
    const caExists = fs.existsSync(paths.ca);
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

    const paths = this.certPaths;
    const sslOptions = {
      key: fs.readFileSync(paths.key),
      cert: fs.readFileSync(paths.cert),
    };

    // Add CA certificate if available
    if (fs.existsSync(paths.ca)) {
      sslOptions.ca = fs.readFileSync(paths.ca);
    }

    logger.info("SSL options loaded successfully");
    return sslOptions;
  }

  // Get certificate info (for debugging)
  getCertificateInfo() {
    try {
      const paths = this.certPaths;
      const stats = {
        key: fs.existsSync(paths.key) ? fs.statSync(paths.key) : null,
        cert: fs.existsSync(paths.cert) ? fs.statSync(paths.cert) : null,
        ca: fs.existsSync(paths.ca) ? fs.statSync(paths.ca) : null,
      };

      const info = {};
      Object.keys(stats).forEach((key) => {
        if (stats[key]) {
          info[key] = {
            exists: true,
            size: stats[key].size,
            modified: stats[key].mtime.toISOString(),
            path: paths[key],
          };
        } else {
          info[key] = {
            exists: false,
            path: paths[key],
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
