// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

import Loading from './comp/Loading';

// Lazy loaded components
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardScreen = lazy(() => import('./pages/DashboardScreen'));
const Hardware = lazy(() => import('./pages/Hardware'));
const Software = lazy(() => import('./pages/Software'));
const Schedule = lazy(() => import('./pages/MaintenanceScreen/pages/Schedule'));
const Summary = lazy(() => import('./pages/Summary'));
const AssetManagement = lazy(() => import('./pages/AssetManagement/AssetManagementPage'));
const Cyber = lazy(() => import('./pages/Cyber'));
const Infrastruktur = lazy(() => import('./pages/Infrastruktur'));
const StokKontrol = lazy(() => import('./pages/StokKontrol'));
const WorkOrderScreen = lazy(() => import('./pages/WorkOrderScreen/index.js'));
const PMSchedule = lazy(() => import('./pages/MaintenanceScreen/pages/PMSchedule'));
const PMTask = lazy(() => import('./pages/MaintenanceScreen/pages/PMTask'));
const PMCalendar = lazy(() => import('./pages/MaintenanceScreen/pages/PMCalendar'));
const PMHistory = lazy(() => import('./pages/MaintenanceScreen/pages/PMHistory'));

// New pages for 100% flowchart compliance
const DashboardUser = lazy(() => import('./pages/DashboardUser'));
const FormPengajuanAset = lazy(() => import('./pages/FormPengajuanAset'));
const PergantianPengguna = lazy(() => import('./pages/PergantianPengguna'));
const DeliveryDistribusi = lazy(() => import('./pages/DeliveryDistribusi'));
const ListDepresiasi = lazy(() => import('./pages/ListDepresiasi'));
const BeritaAcara = lazy(() => import('./pages/BeritaAcara'));
const ApprovalSystem = lazy(() => import('./pages/ApprovalSystem'));
const AbnormalityManagement = lazy(() => import('./pages/AbnormalityManagement'));
const CorrectiveAction = lazy(() => import('./pages/CorrectiveAction'));

import ProtectedRoute from './ProtectedRoute';
import { encryptPath } from './router/encryptPath';
import MainLayout from './layout/MainLayout';

import { AssetProvider } from './context/AssetContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <AssetProvider>
        <MaintenanceProvider>
          <ToastContainer />
          <Router>
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public Route */}
                <Route path='/login' element={<LoginScreen />} />

                {/* Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path={`/${encryptPath('dashboard')}`} element={<DashboardScreen />} />
                  <Route path={`/${encryptPath('hardware')}`} element={<Hardware />} />
                  <Route path={`/${encryptPath('software')}`} element={<Software />} />
                  <Route path={`/${encryptPath('schedule')}`} element={<Schedule />} />
                  <Route path={`/${encryptPath('cyber')}`} element={<Cyber />} />
                  <Route path={`/${encryptPath('infrastruktur')}`} element={<Infrastruktur />} />
                  <Route path={`/${encryptPath('summary')}`} element={<Summary />} />
                  <Route
                    path={`/${encryptPath('asset management')}`}
                    element={<AssetManagement />}
                  />
                  <Route
                    path={`/${encryptPath('asset client')}`}
                    element={<Navigate to={`/${encryptPath('asset management')}`} replace />}
                  />
                  <Route
                    path={`/${encryptPath('asset utama')}`}
                    element={<Navigate to={`/${encryptPath('asset management')}`} replace />}
                  />
                  <Route path={`/${encryptPath('stok kontrol')}`} element={<StokKontrol />} />
                  <Route path={`/${encryptPath('pm-schedule')}`} element={<PMSchedule />} />
                  <Route path={`/${encryptPath('pm-task')}`} element={<PMTask />} />
                  <Route path={`/${encryptPath('pm-calendar')}`} element={<PMCalendar />} />
                  <Route path={`/${encryptPath('pm-history')}`} element={<PMHistory />} />
                  <Route path={`/${encryptPath('workorder')}`} element={<WorkOrderScreen />} />

                  {/* New routes for 100% flowchart compliance */}
                  <Route path={`/${encryptPath('dashboard user')}`} element={<DashboardUser />} />
                  <Route
                    path={`/${encryptPath('form pengajuan aset')}`}
                    element={<FormPengajuanAset />}
                  />
                  <Route
                    path={`/${encryptPath('pergantian pengguna')}`}
                    element={<PergantianPengguna />}
                  />
                  <Route
                    path={`/${encryptPath('delivery distribusi')}`}
                    element={<DeliveryDistribusi />}
                  />
                  <Route path={`/${encryptPath('list depresiasi')}`} element={<ListDepresiasi />} />
                  <Route path={`/${encryptPath('berita acara')}`} element={<BeritaAcara />} />
                  <Route path={`/${encryptPath('approval system')}`} element={<ApprovalSystem />} />
                  <Route
                    path={`/${encryptPath('abnormality management')}`}
                    element={<AbnormalityManagement />}
                  />
                  <Route
                    path={`/${encryptPath('corrective action')}`}
                    element={<CorrectiveAction />}
                  />
                </Route>

                {/* Fallback */}
                <Route path='*' element={<Navigate to='/login' />} />
              </Routes>
            </Suspense>
          </Router>
        </MaintenanceProvider>
      </AssetProvider>
    </SocketProvider>
  );
}

export default App;
