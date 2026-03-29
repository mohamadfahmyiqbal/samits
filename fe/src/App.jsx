// src/App.jsx
import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

/* eslint-disable */
import Loading from './comp/Loading';
import ProtectedRoute from './ProtectedRoute';
import { encryptPath } from './router/encryptPath';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { AssetProvider } from './context/AssetContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { SocketProvider } from './context/SocketContext';
import { allRoutes } from './routes';
import { renderRoutes } from './utils/routeRenderer';
/* eslint-enable */

// Immediate debug
console.log('🚀 App.jsx file loaded!');
console.log('📦 Routes imported:', allRoutes.length);

// Public routes (still lazy loaded)
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const TestRoute = lazy(() => import('./components/TestRoute'));
const DebugAuth = lazy(() => import('./components/DebugAuth'));

const App = memo(function App() {
  console.log('=== App.jsx Debug ===');
  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <SocketProvider>
        <AssetProvider>
          <MaintenanceProvider>
            <ToastContainer />
            <Router>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path='/login' element={<LoginScreen />} />
                  <Route path='/test' element={<TestRoute />} />
                  <Route path='/debug-auth' element={<DebugAuth />} />
                  <Route
                    path='/'
                    element={<Navigate to={`${process.env.REACT_APP_BASE_URL || ''}/login`} />}
                  />

                  {/* Protected Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    {console.log('Rendering protected routes...')}
                    {renderRoutes(allRoutes)}

                    {/* Fallback untuk protected routes */}
                    <Route
                      path='*'
                      element={
                        <Navigate
                          to={`${process.env.REACT_APP_BASE_URL || ''}/${encryptPath('dashboard')}`}
                        />
                      }
                    />
                  </Route>

                  {/* Fallback untuk public routes */}
                  <Route
                    path='*'
                    element={<Navigate to={`${process.env.REACT_APP_BASE_URL || ''}/login`} />}
                  />
                </Routes>
              </Suspense>
            </Router>
          </MaintenanceProvider>
        </AssetProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
});

export default App;
