// config/database.js
import { Sequelize } from "sequelize";
import config from "./config.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];
if (!dbConfig) {
  throw new Error(
    `Konfigurasi database untuk NODE_ENV="${env}" tidak ditemukan.`,
  );
}

// Enhanced Sequelize configuration
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool,
    dialectOptions: dbConfig.dialectOptions,
  },
);

export { Sequelize };
export default sequelize;
