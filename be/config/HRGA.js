import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.NODE_ENV || "development";

const hrgaConfig = {
  database: process.env.HRGA_DB_NAME || "HRGADB",
  username: process.env.HRGA_DB_USER || process.env.DB_USER,
  password: process.env.HRGA_DB_PASSWORD || process.env.DB_PASSWORD,
  host: process.env.HRGA_DB_HOST || process.env.DB_HOST,
  port: Number(process.env.HRGA_DB_PORT || process.env.DB_PORT || 1433),
};

const missingEnv = [];
if (!hrgaConfig.username) missingEnv.push("HRGA_DB_USER/DB_USER");
if (!hrgaConfig.password) missingEnv.push("HRGA_DB_PASSWORD/DB_PASSWORD");
if (!hrgaConfig.host) missingEnv.push("HRGA_DB_HOST/DB_HOST");

if (missingEnv.length) {
  throw new Error(
    `HRGA DB config belum lengkap. Set env: ${missingEnv.join(", ")}`
  );
}

const isProduction = env === "production";
const sqlLogging =
  String(process.env.HRGA_DB_LOG_SQL || "").toLowerCase() === "true";

const HRGA = new Sequelize(
  hrgaConfig.database,
  hrgaConfig.username,
  hrgaConfig.password,
  {
    host: hrgaConfig.host,
    port: hrgaConfig.port,
    dialect: "mssql",
    logging: !isProduction && sqlLogging ? console.log : false,
    pool: {
      max: Number(process.env.HRGA_DB_POOL_MAX || 20),
      min: Number(process.env.HRGA_DB_POOL_MIN || 0),
      acquire: Number(process.env.HRGA_DB_POOL_ACQUIRE || 60000),
      idle: Number(process.env.HRGA_DB_POOL_IDLE || 10000),
      evict: Number(process.env.HRGA_DB_POOL_EVICT || 1000),
    },
    dialectOptions: {
      options: {
        encrypt: String(process.env.HRGA_DB_ENCRYPT || "true").toLowerCase() === "true",
        trustServerCertificate:
          String(process.env.HRGA_DB_TRUST_CERT || (isProduction ? "false" : "true")).toLowerCase() === "true",
        enableArithAbort: true,
        requestTimeout: Number(process.env.HRGA_DB_REQUEST_TIMEOUT || 60000),
      },
    },
  }
);

export default HRGA;
