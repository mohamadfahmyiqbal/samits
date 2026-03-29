// ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // Debug logging - always show in development
  console.log('=== ProtectedRoute Debug ===');
  console.log('Token exists:', !!token);
  console.log('Token value (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null');
  console.log('Current path:', window.location.pathname);
  console.log('Environment:', process.env.NODE_ENV);

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return <Navigate to='/login' replace />;
  }

  try {
    // Decode token to check if it's expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    console.log('Token decoded successfully');
    console.log('Token expires at:', new Date(decodedToken.exp * 1000));
    console.log('Current time:', new Date(currentTime * 1000));
    console.log('Token expired:', decodedToken.exp < currentTime);

    if (decodedToken.exp < currentTime) {
      // Token expired, remove it and redirect to login
      console.log('❌ Token expired, removing and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      return <Navigate to='/login' replace />;
    }

    console.log('✅ Token valid, rendering children');
    return children;
  } catch (error) {
    // Invalid token format, remove it and redirect to login
    console.log('❌ Invalid token format, removing and redirecting to login:', error.message);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    return <Navigate to='/login' replace />;
  }
}
