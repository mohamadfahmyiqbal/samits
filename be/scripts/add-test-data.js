// Add test data
import { initializeDB, db } from '../models/index.js';

async function addTestData() {
  try {
    await initializeDB();
    const MaintenancePlan = db.MaintenancePlan;
    
    const result = await MaintenancePlan.create({
      plan_name: 'Test Maintenance Plan',
      asset_id: 1,
      plan_type: 'Preventive',
      frequency: 'Monthly',
      next_due_date: '2026-04-01'
    });
    
    console.log('Created:', result.toJSON());
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addTestData();
