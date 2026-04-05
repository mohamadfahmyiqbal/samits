// Test database connection
import dotenv from "dotenv";
dotenv.config();

console.log("=== Database Configuration Check ===");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Test actual database connection
import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mssql",
    logging: console.log,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: process.env.NODE_ENV === "development",
        enableArithAbort: true,
        connectTimeout: 60000,
        requestTimeout: 60000,
      },
    },
  },
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");

    // Test basic query
    const [results] = await sequelize.query("SELECT @@VERSION as version");
    console.log("Database version:", results[0].version);

    // Check if users table exists
    const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            AND TABLE_NAME LIKE '%user%' OR TABLE_NAME LIKE '%User%'
        `);
    console.log("User-related tables:", tables);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
