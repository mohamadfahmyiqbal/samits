import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import reportWebVitals from './reportWebVitals';

console.log('🌟 index.js loaded!');
console.log('🌟 About to import App component...');

let App;
try {
  App = require('./App').default;
  console.log('✅ App component imported successfully!');
} catch (error) {
  console.error('❌ Error importing App component:', error);
  // Fallback component
  App = () => <div>Error loading app. Check console for details.</div>;
}

console.log('🌟 About to render App component...');

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  root.render(<App />);
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering App:', error);
  root.render(
    <div style={{ padding: '20px', color: 'red' }}>
      <h2>Error rendering App</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
