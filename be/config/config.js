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
    dialectOptions: {
      options: {
        // Opsi khusus untuk koneksi MSSQL/Tedious
        encrypt: false, // Disable encryption for local development
        trustServerCertificate: true, // Trust self-signed certificates
        enableArithAbort: true,
        // Additional security options
        connectTimeout: 60000, // 60 seconds timeout
        requestTimeout: 60000, // 60 seconds timeout
        // Authentication options
        trustServerCertificate: true,
        useUTC: false,
      },
      // Enable Windows Authentication if no username provided
      ...(process.env.DB_USER === "" && {
        authentication: {
          type: "ntlm",
          options: {
            domain: process.env.USERDOMAIN || "localhost",
          },
        },
      }),
    },
    // Security settings
    pool: {
      max: 10, // Maximum number of connection in pool
      min: 0, // Minimum number of connection in pool
      acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
      evict: 1000, // How often a pooled connection should be checked, in milliseconds
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
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false, // Lebih aman di produksi
        enableArithAbort: true,
        // Production security options
        connectTimeout: 60000,
        requestTimeout: 60000,
      },
    },
    // Production security settings
    pool: {
      max: 20, // Higher pool for production
      min: 5, // Minimum connections for production
      acquire: 30000,
      evict: 1000,
      idle: 10000, // Close idle connections after 10 seconds
    },
  },
};

export default config;
