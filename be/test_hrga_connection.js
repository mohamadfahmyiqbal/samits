// Test script untuk cek koneksi HRGA database
import HRGA from "./config/HRGA.js";

const testHRGAConnection = async () => {
  console.log("=========================================");
  console.log("Testing HRGA Database Connection");
  console.log("=========================================\n");

  try {
    // Test 1: Authenticate connection
    console.log("1. Testing authentication...");
    await HRGA.authenticate();
    console.log("   ✅ Connection authenticated successfully\n");

    // Test 2: Check if table exists
    console.log("2. Checking if [users] table exists...");
    const [tables] = await HRGA.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = 'users'
    `);

    if (tables.length === 0) {
      console.error("   ❌ Table [users] does NOT exist!\n");
      console.log("   📝 To fix this, run this SQL in HRGADB:\n");
      console.log("   CREATE TABLE [users] (");
      console.log("       NIK VARCHAR(20) NOT NULL PRIMARY KEY,");
      console.log("       NAMA VARCHAR(100) NULL,");
      console.log("       DEPT VARCHAR(100) NULL,");
      console.log("       DIVISI VARCHAR(100) NULL");
      console.log("   );\n");
      console.log("   📄 Or run: ddl_hrga_user.sql\n");
      process.exit(1);
    }
    console.log("   ✅ Table [users] exists\n");

    // Test 3: Query test
    console.log("3. Testing query to [users] table...");
    const [results] = await HRGA.query("SELECT COUNT(*) as total FROM [users]");
    console.log(`   Query successful. Total records: ${results[0].total}\n`);

    // Test 4: Sample data
    console.log("4. Fetching sample data...");
    const [sample] = await HRGA.query(
      "SELECT TOP 3 NIK, NAMA, DEPT FROM [users] ORDER BY NAMA",
    );
    console.log("   Sample records:");
    sample.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.NIK} - ${row.NAMA} (${row.DEPT})`);
    });

    console.log("\n=========================================");
    console.log("All tests passed! HRGA DB is connected.");
    console.log("=========================================");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ HRGA Connection Failed:\n");
    console.error("Error:", error.message);
    console.error("\nPossible causes:");
    console.error("- HRGADB database doesn't exist");
    console.error("- SQL Server not running or not accessible");
    console.error("- Wrong credentials or connection settings");
    console.error("\nCurrent config:");
    console.error(
      "- Database:",
      process.env.HRGA_DB_NAME || "HRGADB (default)",
    );
    console.error(
      "- Host:",
      process.env.HRGA_DB_HOST || process.env.DB_HOST || "127.0.0.1",
    );
    console.error(
      "- User:",
      process.env.HRGA_DB_USER || process.env.DB_USER || "not set",
    );
    process.exit(1);
  }
};

testHRGAConnection();
