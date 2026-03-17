
// config/config.js
import dotenv from 'dotenv';
dotenv.config();

const config = {
  // --- Konfigurasi Development ---
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 1433), // Port default SQL Server
    dialect: 'mssql', // Dialect untuk SQL Server
    logging: console.log, // Tampilkan log SQL di console
    dialectOptions: {
      options: {
        // Opsi khusus untuk koneksi MSSQL/Tedious
        encrypt: true, // Direkomendasikan jika menggunakan Azure SQL atau koneksi aman
        trustServerCertificate: true, // Gunakan ini jika sertifikat server self-signed (development)
        enableArithAbort: true,
      }
    }
  },
  
  // --- Konfigurasi Production ---
  production: {
    username: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: Number(process.env.PROD_DB_PORT || 1433),
    dialect: 'mssql',
    logging: false, // Nonaktifkan logging di produksi
    dialectOptions: {
      options: {
        encrypt: true, 
        trustServerCertificate: false, // Lebih aman di produksi
        enableArithAbort: true,
      }
    }
  }
};

export default config;
