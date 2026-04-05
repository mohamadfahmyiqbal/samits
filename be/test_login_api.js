// Test login API
import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('Testing login API...');
    
    const response = await fetch('https://localhost:5002/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nik: 'test',
        password: 'test'
      }),
      // Ignore SSL certificate for localhost
      agent: new (await import('https')).Agent({
        rejectUnauthorized: false
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
    if (data.success && data.data.token) {
      console.log('✅ Login successful!');
      console.log('Token:', data.data.token.substring(0, 50) + '...');
      
      // Test API with token
      console.log('\nTesting API with token...');
      const assetsResponse = await fetch('https://localhost:5002/api/assets?group=utama', {
        headers: {
          'Authorization': `Bearer ${data.data.token}`,
        },
        agent: new (await import('https')).Agent({
          rejectUnauthorized: false
        })
      });
      
      console.log('Assets API Status:', assetsResponse.status);
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        console.log('✅ Assets API works!');
      } else {
        const errorData = await assetsResponse.json();
        console.log('❌ Assets API failed:', errorData);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
