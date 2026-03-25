// config/config.js
import dotenv from "dotenv";
dotenv.config();

const config = {
  // --- Konfigurasi Development ---
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1433), // Port default SQL Server
    dialect: "mssql", // Dialect untuk SQL Server
    logging: console.log, // Tampilkan log SQL di console
    // Connection pooling configuration
    pool: {
      max: 10, // Maximum number of connections in pool
      min: 2, // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) that pool will try to get connection before throwing error
      idle: 10000, // Maximum time (ms) that a connection can be idle before being released
    },
    dialectOptions: {
      options: {
        // Opsi khusus untuk koneksi MSSQL/Tedious
        encrypt: false, // Disable encryption for development
        trustServerCertificate: true, // Gunakan ini jika sertifikat server self-signed (development)
        enableArithAbort: true,
        // Timeout configuration
        connectTimeout: 60000, // Connection timeout in ms
        requestTimeout: 60000, // Request timeout in ms
      },
    },
  },

  // --- Konfigurasi Production ---
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: Number(process.env.PROD_DB_PORT || 1433),
    dialect: "mssql",
    logging: false, // Nonaktifkan logging di produksi
    // Production connection pooling
    pool: {
      max: 20, // Higher max for production
      min: 5, // Higher min for production
      acquire: 60000, // Longer acquire timeout for production
      idle: 30000, // Longer idle timeout for production
    },
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false, // Lebih aman di produksi
        enableArithAbort: true,
        // Production timeout configuration
        connectTimeout: 60000,
        requestTimeout: 60000,
      },
    },
  },
};

export default config;
