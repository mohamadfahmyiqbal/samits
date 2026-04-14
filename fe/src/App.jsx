// src/App.jsx
import React, { Suspense, lazy, memo } from 'react';
import {
 BrowserRouter as Router,
 Routes,
 Route,
 Navigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Loading from './components/shared/Loader';
import ProtectedRoute from './ProtectedRoute.jsx';
import { encryptPath } from './routes/pathEncoding';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { AssetProvider } from './context/AssetContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { SocketProvider } from './context/SocketContext';
import { allRoutes } from './routes';
import { renderRoutes } from './routes/routeRenderer';

const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const TestRoute = lazy(() => import('./components/TestRoute'));
const DebugAuth = lazy(() => import('./components/DebugAuth'));

const baseUrl = (() => {
 const raw = process.env.REACT_APP_BASE_URL || '';
 const trimmed = raw.replace(/\/+$/u, '');

 if (!trimmed) return '';

 return trimmed.startsWith('/')
  ? trimmed
  : `/${trimmed}`;
})();

const App = memo(function App() {
 return (
  <ErrorBoundary
   homePath='/login'
   title='Application error'
   description='Something went wrong while loading the application. Please try again or go back to login.'
   homeLabel='Go to Login'
   refreshLabel='Reload App'
   resultStatus='500'
  >
   <ToastContainer />

   <Router basename={baseUrl || undefined}>
    <Suspense fallback={<Loading />}>
     <Routes>
      <Route
       path="/login"
       element={<LoginScreen />}
      />

      <Route
       path="/test"
       element={<TestRoute />}
      />

      <Route
       path="/debug-auth"
       element={<DebugAuth />}
      />

      <Route
       path="/"
       element={
        <Navigate
         to="/login"
         replace
        />
       }
      />

      <Route
       element={
        <ProtectedRoute>
         <SocketProvider>
          <AssetProvider>
           <MaintenanceProvider>
            <MainLayout />
           </MaintenanceProvider>
          </AssetProvider>
         </SocketProvider>
        </ProtectedRoute>
       }
      >
       {renderRoutes(allRoutes)}

       <Route
        path="*"
        element={
         <Navigate
          to={`/${encryptPath(
           'dashboard'
          )}`}
          replace
         />
        }
       />
      </Route>

      <Route
       path="*"
       element={
        <Navigate
         to="/login"
         replace
        />
       }
      />
     </Routes>
    </Suspense>
   </Router>
  </ErrorBoundary>
 );
});

export default App;
