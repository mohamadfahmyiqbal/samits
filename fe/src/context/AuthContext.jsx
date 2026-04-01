import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
  userPermissions: [],
  isAuthenticated: false,
  user: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setUserPermissions(decoded.permissions || []);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const value = {
    userPermissions,
    isAuthenticated,
    user,
    login: (token) => {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      setUser(decoded);
      setUserPermissions(decoded.permissions || []);
      setIsAuthenticated(true);
    },
    logout: () => {
      localStorage.removeItem('token');
      setUser(null);
      setUserPermissions([]);
      setIsAuthenticated(false);
    },
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

