import sequelize from './config/database.js';

async function checkUsers() {
  try {
    const [results] = await sequelize.query('SELECT TOP 5 nik, nama, email, phone, position, status FROM users');
    console.log('Sample users in database:');
    console.table(results);
    
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM users');
    console.log('Total users:', count[0].total);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
