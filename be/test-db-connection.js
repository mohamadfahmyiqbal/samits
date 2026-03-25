// Test database connection
import { initializeDB, sequelize } from './models/index.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await initializeDB();
    
    // Test query
    const [results, metadata] = await sequelize.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'maintenance_plans'");
    console.log('Tables found:', results);
    
    // Test specific table
    const MaintenancePlan = (await import('./models/3_maintenance_flow/MaintenancePlan.js')).default;
    const MaintenancePlanModel = MaintenancePlan(sequelize);
    
    console.log('MaintenancePlan model:', MaintenancePlanModel.getTableName());
    
    // Test count
    const count = await MaintenancePlanModel.count();
    console.log('MaintenancePlan count:', count);
    
    process.exit(0);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testConnection();
