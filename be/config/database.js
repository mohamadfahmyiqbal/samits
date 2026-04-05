// config/database.js

// Import Class Sequelize dan DataTypes dari library
import { Sequelize, DataTypes } from "sequelize";
import config from "./config.js";

// Tentukan environment, default ke 'development'
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];
if (!dbConfig) {
  throw new Error(
    `Konfigurasi database untuk NODE_ENV="${env}" tidak ditemukan.`,
  );
}

// 1. Inisialisasi instance Sequelize (koneksi)
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
    dialectOptions: {
      ...dbConfig.dialectOptions,
      options: {
        useUTC: false,
        dateFormat: "yyyy-mm-dd HH:MM:ss",
      },
    },
    timezone: false,
  },
);

const formatDateForMsSql = (date) => {
  const pad = (value, length = 2) => value.toString().padStart(length, "0");
  const padMilliseconds = (value) => value.toString().padStart(3, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}.${padMilliseconds(date.getMilliseconds())}`;
};

if (sequelize.getDialect() === "mssql") {
  DataTypes.DATE.prototype._stringify = function (date, options) {
    if (!date) {
      return null;
    }
    return formatDateForMsSql(typeof date === "number" ? new Date(date) : date);
  };
}

// 2. Export Class Sequelize dan instance koneksi
// models/index.js mengimpor: import sequelize, { Sequelize } from '../config/database.js';

// Named Export: Class Sequelize (DIBUTUHKAN UNTUK MEMPERBAIKI ERROR)
export { Sequelize };

// Default Export: instance koneksi
export default sequelize;
