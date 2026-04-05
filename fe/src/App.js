// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import Hardware from './pages/Hardware';
import Software from './pages/Software';
import Summary from './pages/Summarry'; // typo fixed
import AssetManagement from './pages/AssetManagement/AssetManagementPage';
import Cyber from './pages/Cyber';
import Infrastruktur from './pages/Infrastruktur';
import StokKontrol from './pages/StokKontrol';
import WorkOrderScreen from './pages/WorkOrderScreen/index.js';
import PMSchedule from './pages/MaintenanceScreen/pages/PMSchedule';
import PMTask from './pages/MaintenanceScreen/pages/PMTask';
import PMCalendar from './pages/MaintenanceScreen/pages/PMCalendar';
import PMHistory from './pages/MaintenanceScreen/pages/PMHistory';
import Schedule from './pages/MaintenanceScreen/pages/Schedule';
import DataPengguna from './pages/DataPengguna/DataPengguna';
import DepreciationList from './pages/DepreciationList/DepreciationList';
import MaintenanceSchedule from './pages/MaintenanceSchedule/MaintenanceSchedule';
import Maintenance2 from './pages/Maintenance2/Maintenance2';
import PreventiveChecksheet from './pages/PreventiveChecksheet/PreventiveChecksheet';
import Result from './pages/Result/Result';
import CorrectiveAction from './pages/CorrectiveAction/CorrectiveAction';
import Approval3 from './pages/Approval3/Approval3';
import StockMovement from './pages/AddStock/StockMovement';
import StockOpname from './pages/AddStock/StockOpname';
import Vendors from './pages/Vendors/Vendors';
import ReorderRequest from './pages/ReorderRequest/ReorderRequest';
import SummaryStock from './pages/SummaryStock';
import UsageReport from './pages/UsageReport/UsageReport';
import DeadStockReport from './pages/DeadStockReport/DeadStockReport';
import SummaryAsset from './pages/SummaryAsset';
import SummaryMaintenance from './pages/SummaryMaintenance';
import UserManagement from './pages/UserManagement';
import BreakdownLog from './pages/BreakdownLog';
import InspectionReports from './pages/InspectionReports';
import PartsRequest from './pages/PartsRequest';
import VendorAssignments from './pages/VendorAssignments';
import SLADashboard from './pages/SLADashboard';

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
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                <Route path={`/${encryptPath('asset-management')}`} element={<AssetManagement />} />
                <Route path={`/${encryptPath('data-pengguna')}`} element={<DataPengguna />} />
                <Route
                  path={`/${encryptPath('depreciation-list')}`}
                  element={<DepreciationList />}
                />
                <Route
                  path={`/${encryptPath('asset client')}`}
                  element={<Navigate to={`/${encryptPath('asset-management')}`} replace />}
                />
                <Route
                  path={`/${encryptPath('asset utama')}`}
                  element={<Navigate to={`/${encryptPath('asset-management')}`} replace />}
                />
                <Route path={`/${encryptPath('stok kontrol')}`} element={<StokKontrol />} />
                <Route path={`/${encryptPath('pm-schedule')}`} element={<PMSchedule />} />
                <Route path={`/${encryptPath('pm-task')}`} element={<PMTask />} />
                <Route path={`/${encryptPath('pm-calendar')}`} element={<PMCalendar />} />
                <Route path={`/${encryptPath('pm-history')}`} element={<PMHistory />} />
                <Route
                  path={`/${encryptPath('maintenance-schedule')}`}
                  element={<MaintenanceSchedule />}
                />
                <Route path={`/${encryptPath('maintenance2')}`} element={<Maintenance2 />} />
                <Route
                  path={`/${encryptPath('preventive-checksheet')}`}
                  element={<PreventiveChecksheet />}
                />
                <Route path={`/${encryptPath('result')}`} element={<Result />} />
                <Route
                  path={`/${encryptPath('corrective-action')}`}
                  element={<CorrectiveAction />}
                />
                <Route path={`/${encryptPath('approval3')}`} element={<Approval3 />} />
                <Route path={`/${encryptPath('stock-movement')}`} element={<StockMovement />} />
                <Route path={`/${encryptPath('stock-opname')}`} element={<StockOpname />} />
                <Route path={`/${encryptPath('vendors')}`} element={<Vendors />} />
                <Route path={`/${encryptPath('reorder-request')}`} element={<ReorderRequest />} />
                <Route path={`/${encryptPath('summary-stock')}`} element={<SummaryStock />} />
                <Route path={`/${encryptPath('usage-report')}`} element={<UsageReport />} />
                <Route
                  path={`/${encryptPath('dead-stock-report')}`}
                  element={<DeadStockReport />}
                />
                <Route path={`/${encryptPath('summary-asset')}`} element={<SummaryAsset />} />
                <Route
                  path={`/${encryptPath('summary-maintenance')}`}
                  element={<SummaryMaintenance />}
                />
                <Route path={`/${encryptPath('workorder')}`} element={<WorkOrderScreen />} />
                <Route path={`/${encryptPath('user management')}`} element={<UserManagement />} />
                <Route path={`/${encryptPath('breakdown log')}`} element={<BreakdownLog />} />
                <Route
                  path={`/${encryptPath('inspection reports')}`}
                  element={<InspectionReports />}
                />
                <Route path={`/${encryptPath('parts request')}`} element={<PartsRequest />} />
                <Route
                  path={`/${encryptPath('vendor assignments')}`}
                  element={<VendorAssignments />}
                />
                <Route path={`/${encryptPath('sla dashboard')}`} element={<SLADashboard />} />
              </Route>

              {/* Fallback */}
              <Route path='*' element={<Navigate to='/login' />} />
            </Routes>
          </Router>
        </MaintenanceProvider>
      </AssetProvider>
    </SocketProvider>
  );
}

export default App;
