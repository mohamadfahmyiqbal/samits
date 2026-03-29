// Check actual table structure
import { initializeDB, sequelize } from '../models/index.js';

async function checkTable() {
  try {
    await initializeDB();
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'maintenance_plans'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('Actual table structure:');
    results.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTable();
