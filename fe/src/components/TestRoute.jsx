import React from 'react';

export default function TestRoute() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🎉 Test Route Berhasil!</h1>
      <p>Route ini bisa diakses tanpa login</p>
      <a href='https://localhost:3000/debug-auth'>Go to Debug Auth</a>
    </div>
  );
}
