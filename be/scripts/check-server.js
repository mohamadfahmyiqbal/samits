import http from 'http';

const options = {
    host: 'localhost',
    port: 5002,
    path: '/api/users/login',
    method: 'GET',
    timeout: 2000
};

const req = http.request(options, (res) => {
    console.log(`✅ Server responding! Status: ${res.statusCode}`);
    console.log(`🌐 Server running at http://localhost:5002`);
    process.exit(0);
});

req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.log('❌ Server not running on port 5002');
        console.log('💡 Start server with: npm start');
    } else {
        console.log('❌ Connection error:', err.message);
    }
    process.exit(1);
});

req.on('timeout', () => {
    console.log('⏰ Request timeout - server may be starting...');
    process.exit(1);
});

req.end();
