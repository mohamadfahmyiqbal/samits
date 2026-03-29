// Test MaintenancePlan query
import { initializeDB, db } from "../models/index.js";

async function testQuery() {
  try {
    console.log("Initializing database...");
    await initializeDB();

    console.log("Available models:", Object.keys(db));

    const MaintenancePlan = db.MaintenancePlan;
    if (!MaintenancePlan) {
      throw new Error("MaintenancePlan model not found!");
    }

    console.log("MaintenancePlan model:", MaintenancePlan.getTableName());

    // Test simple query first
    console.log("Testing count...");
    const count = await MaintenancePlan.count();
    console.log("Count:", count);

    // Test findAll with basic where
    console.log("Testing findAll...");
    const all = await MaintenancePlan.findAll({ limit: 1 });
    console.log("First record:", all[0]?.toJSON());

    // Test the problematic query
    console.log("Testing active logs query...");
    const logs = await MaintenancePlan.findAll({
      where: {
        status: ["pending", "in-progress"],
      },
      order: [["scheduled_date", "ASC"]],
    });

    console.log("Active logs:", logs.length);
    console.log("Success!");
    process.exit(0);
  } catch (error) {
    console.error("Query test failed:", error);
    console.error("Error details:", error.original);
    process.exit(1);
  }
}

testQuery();
