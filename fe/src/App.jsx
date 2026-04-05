// src/App.jsx
import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

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

// Immediate debug
// Production clean

// Public routes (still lazy loaded)
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const TestRoute = lazy(() => import('./components/TestRoute'));
const DebugAuth = lazy(() => import('./components/DebugAuth'));

const baseUrl = (() => {
  const raw = process.env.REACT_APP_BASE_URL || '';
  const trimmed = raw.replace(/\/+$/u, '');
  if (!trimmed) return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
})();

const withBasePath = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl || ''}${normalizedPath}`;
};

const App = memo(function App() {

 return (
  <ErrorBoundary>
   <SocketProvider>
    <AssetProvider>
     <MaintenanceProvider>
      <ToastContainer />
      <Router basename={baseUrl || undefined}>
       <Suspense fallback={<Loading />}>
        <Routes>
         {/* Public Routes */}
         <Route path='/login' element={<LoginScreen />} />
         <Route path='/test' element={<TestRoute />} />
         <Route path='/debug-auth' element={<DebugAuth />} />
         <Route path='/' element={<Navigate to={withBasePath('/login')} />} />

         {/* Protected Routes */}
         <Route
          element={
           <ProtectedRoute>
            <MainLayout />
           </ProtectedRoute>
          }
         >
          {renderRoutes(allRoutes)}

          {/* Fallback untuk protected routes */}
          <Route
           path='*'
           element={
            <Navigate to={withBasePath(`/${encryptPath('dashboard')}`)} />
           }
          />
         </Route>

         {/* Fallback untuk public routes */}
         <Route path='*' element={<Navigate to={withBasePath('/login')} />} />
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
