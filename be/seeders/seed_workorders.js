// be/seeders/seed_workorders.js
// Sample data untuk test WorkOrderScreen

import WorkOrder from '../models/3_maintenance_flow/WorkOrder.js';

export const seedWorkOrders = async () => {
  const sampleData = [
    {
      wo_id: 1,
      title: 'PM Server Rack 01',
      description: 'Monthly preventive maintenance',
      asset_id: 1,
      status: 'open',
      priority: 'medium',
      requested_by: 'IT001',
      request_date: new Date(),
      category: 'preventive'
    },
    {
      wo_id: 2,
      title: 'AC Room Server Broken',
      description: 'Emergency repair AC unit',
      asset_id: 5,
      status: 'in_progress',
      priority: 'emergency',
      requested_by: 'FM001',
      request_date: new Date(Date.now() - 86400000),
      category: 'breakdown'
    }
  ];

  // Insert if table empty
  const count = await WorkOrder.count();
  if (count === 0) {
    await Promise.all(sampleData.map(data => WorkOrder.create(data)));
    console.log('✅ Seeded 2 sample work orders');
  }
};

