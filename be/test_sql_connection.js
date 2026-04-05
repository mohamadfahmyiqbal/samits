// Test SQL Server connection directly
import dotenv from "dotenv";
dotenv.config();

console.log("=== SQL Server Connection Test ===");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "***SET***" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

// Test with different connection options
import { Sequelize } from "sequelize";

const testConfigs = [
  {
    name: "Basic Connection",
    options: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mssql",
      logging: console.log,
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
    },
  },
  {
    name: "With Windows Auth",
    options: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mssql",
      logging: console.log,
      dialectOptions: {
        authentication: {
          type: "default",
          options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
          },
        },
        options: {
          encrypt: false,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
    },
  },
];

async function testConnections() {
  for (const config of testConfigs) {
    console.log(`\n--- Testing: ${config.name} ---`);
    
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      config.options
    );

    try {
      await sequelize.authenticate();
      console.log("✅ Connection successful!");
      
      // Test basic query
      const [results] = await sequelize.query("SELECT @@VERSION as version");
      console.log("SQL Server version:", results[0].version.split('\n')[0]);
      
      await sequelize.close();
    } catch (error) {
      console.error("❌ Connection failed:", error.message);
      if (error.parent) {
        console.error("Parent error:", error.parent.message);
      }
    }
  }
}

testConnections();
