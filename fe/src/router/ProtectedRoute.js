// ProtectedRoute.js
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Sudah benar mengecek 'token', asalkan LoginScreen juga menyimpannya sebagai 'token'
  const token = localStorage.getItem('token'); 
  return token ? children : <Navigate to="/login" replace />;
}