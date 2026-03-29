// src/App.jsx
import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/app.css';

import Loading from './comp/Loading';

import ProtectedRoute from './ProtectedRoute';
import { encryptPath } from './router/encryptPath';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/shared/ErrorBoundary';

import { AssetProvider } from './context/AssetContext';
import { MaintenanceProvider } from './context/MaintenanceContext';
import { SocketProvider } from './context/SocketContext';

// Lazy loaded components
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const DashboardScreen = lazy(() => import('./pages/DashboardScreen'));
const Hardware = lazy(() => import('./pages/AssetHardware/AssetHardware'));
const Software = lazy(() => import('./pages/AssetSoftware/AssetSoftware'));
const Cyber = lazy(() => import('./pages/SecurityCyber/SecurityCyber'));
const Infrastruktur = lazy(() => import('./pages/Infrastructure/Infrastructure'));
const Schedule = lazy(() => import('./pages/MaintenanceScreen/pages/Schedule'));
const Summary = lazy(() => import('./pages/Summary'));
const AssetManagement = lazy(() => import('./pages/AssetManagement/AssetManagementPage'));
const StokKontrol = lazy(() => import('./pages/StokKontrol/StokKontrol'));
const WorkOrderScreen = lazy(() => import('./pages/WorkOrderScreen/index.js'));
const PMSchedule = lazy(() => import('./pages/MaintenanceScreen/pages/PMSchedule'));
const PMTask = lazy(() => import('./pages/MaintenanceScreen/pages/PMTask'));
const PMCalendar = lazy(() => import('./pages/MaintenanceScreen/pages/PMCalendar'));
const PMHistory = lazy(() => import('./pages/MaintenanceScreen/pages/PMHistory'));

// New pages for 100% flowchart compliance
const DashboardUser = lazy(() => import('./pages/DashboardUser'));
const FormPengajuanAset = lazy(() => import('./pages/FormPengajuanAset'));
const PergantianPengguna = lazy(() => import('./pages/UserReplacement/UserReplacement'));
const DeliveryDistribusi = lazy(() => import('./pages/DeliveryDistribution/DeliveryDistribution'));
const ListDepresiasi = lazy(() => import('./pages/DepreciationList/DepreciationList'));
const BeritaAcara = lazy(() => import('./pages/MeetingMinutes/MeetingMinutes'));
const ApprovalSystem = lazy(() => import('./pages/ApprovalSystem'));
const AbnormalityManagement = lazy(() => import('./pages/AbnormalityManagement'));
const CorrectiveAction = lazy(() => import('./pages/CorrectiveAction'));

// Additional components for flowchart compliance
const DataPengguna = lazy(() => import('./pages/DataPengguna/DataPengguna'));
const Finance = lazy(() => import('./pages/Finance/Finance'));
const Finance2 = lazy(() => import('./pages/FinanceDisposal/FinanceDisposal'));
const Invoice = lazy(() => import('./pages/Invoice/Invoice'));
const PilihCategory = lazy(() => import('./pages/SelectCategory/SelectCategory'));
const PilihSchedule = lazy(() => import('./pages/SelectSchedule/SelectSchedule'));
const MaintenanceSchedule = lazy(() => import('./pages/MaintenanceSchedule/MaintenanceSchedule'));
const StockList = lazy(() => import('./pages/StockList/StockList'));
const MinimumStock = lazy(() => import('./pages/MinimumStock/MinimumStock'));
const AddStock = lazy(() => import('./pages/AddStock/AddStock'));
const PartCategory = lazy(() => import('./pages/PartCategory/PartCategory'));
const UserApproval = lazy(() => import('./pages/UserApproval/UserApproval'));
const FinanceApproval = lazy(() => import('./pages/FinanceApproval/FinanceApproval'));
const PDApproval = lazy(() => import('./pages/ApprovalDirector/ApprovalDirector'));
const JobRequest2 = lazy(() => import('./pages/JobRequestAbnormality/JobRequestAbnormality'));
const Result2 = lazy(() => import('./pages/ResultAbnormality/ResultAbnormality'));
const Approval4 = lazy(() => import('./pages/ApprovalMaintenance/ApprovalMaintenance'));
const ReqAset = lazy(() => import('./pages/RequestAsset/RequestAsset'));
const PV = lazy(() => import('./pages/PV/PV'));
const Approval2 = lazy(() => import('./pages/ApprovalFinance/ApprovalFinance'));
const PO = lazy(() => import('./pages/PO/PO'));
const Maintenance2 = lazy(() => import('./pages/Maintenance2/Maintenance2'));
const Result = lazy(() => import('./pages/Result/Result'));
const Approval3 = lazy(() => import('./pages/Approval3/Approval3'));

// New pages for complete flowchart compliance
const Aset = lazy(() => import('./pages/Aset/Aset'));
const AssetBaru = lazy(() => import('./pages/AssetBaru/AssetBaru'));
const FormPersonalID = lazy(() => import('./pages/FormPersonalID/FormPersonalID'));
const TicketCreated = lazy(() => import('./pages/TicketCreated/TicketCreated'));
const Finish = lazy(() => import('./pages/Finish/Finish'));
const RequestCreated = lazy(() => import('./pages/RequestCreated/RequestCreated'));
const NewRequest = lazy(() => import('./pages/NewRequest/NewRequest'));
const Delivery = lazy(() => import('./pages/Delivery/Delivery'));
const DashboardMaintenance = lazy(
  () => import('./pages/DashboardMaintenance/DashboardMaintenance')
);
const BreakdownLog = lazy(() => import('./pages/BreakdownLog/BreakdownLog'));
const InspectionReports = lazy(() => import('./pages/InspectionReports/InspectionReports'));
const PartsRequest = lazy(() => import('./pages/PartsRequest/PartsRequest'));
const VendorAssignments = lazy(() => import('./pages/VendorAssignments/VendorAssignments'));
const SLADashboard = lazy(() => import('./pages/SLADashboard/SLADashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement/UserManagement'));

const App = memo(function App() {
  return (
    <ErrorBoundary>
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

                    {/* Asset Menu Routes */}
                    <Route path={`/${encryptPath('asset list')}`} element={<AssetManagement />} />
                    <Route path={`/${encryptPath('new asset')}`} element={<NewRequest />} />
                    <Route
                      path={`/${encryptPath('pengajuan asset')}`}
                      element={<FormPengajuanAset />}
                    />
                    <Route path={`/${encryptPath('update asset')}`} element={<AssetManagement />} />
                    <Route path={`/${encryptPath('disposal asset')}`} element={<Finance2 />} />

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
                    <Route
                      path={`/${encryptPath('list depresiasi')}`}
                      element={<ListDepresiasi />}
                    />
                    <Route path={`/${encryptPath('berita acara')}`} element={<BeritaAcara />} />
                    <Route
                      path={`/${encryptPath('approval system')}`}
                      element={<ApprovalSystem />}
                    />
                    <Route
                      path={`/${encryptPath('abnormality management')}`}
                      element={<AbnormalityManagement />}
                    />
                    <Route
                      path={`/${encryptPath('corrective action')}`}
                      element={<CorrectiveAction />}
                    />

                    {/* Additional routes for complete flowchart compliance */}
                    <Route path={`/${encryptPath('data pengguna')}`} element={<DataPengguna />} />
                    <Route path={`/${encryptPath('finance')}`} element={<Finance />} />
                    <Route path={`/${encryptPath('finance2')}`} element={<Finance2 />} />
                    <Route path={`/${encryptPath('invoice')}`} element={<Invoice />} />
                    <Route path={`/${encryptPath('pilih category')}`} element={<PilihCategory />} />
                    <Route path={`/${encryptPath('pilih schedule')}`} element={<PilihSchedule />} />
                    <Route
                      path={`/${encryptPath('maintenance schedule')}`}
                      element={<MaintenanceSchedule />}
                    />
                    <Route path={`/${encryptPath('stock list')}`} element={<StockList />} />
                    <Route path={`/${encryptPath('minimum stock')}`} element={<MinimumStock />} />
                    <Route path={`/${encryptPath('add stock')}`} element={<AddStock />} />
                    <Route path={`/${encryptPath('part category')}`} element={<PartCategory />} />
                    <Route path={`/${encryptPath('user approval')}`} element={<UserApproval />} />
                    <Route
                      path={`/${encryptPath('finance approval')}`}
                      element={<FinanceApproval />}
                    />
                    <Route path={`/${encryptPath('pd approval')}`} element={<PDApproval />} />
                    <Route path={`/${encryptPath('jobrequest2')}`} element={<JobRequest2 />} />
                    <Route path={`/${encryptPath('result2')}`} element={<Result2 />} />
                    <Route path={`/${encryptPath('approval4')}`} element={<Approval4 />} />
                    <Route path={`/${encryptPath('req aset')}`} element={<ReqAset />} />
                    <Route path={`/${encryptPath('pv')}`} element={<PV />} />
                    <Route path={`/${encryptPath('approval2')}`} element={<Approval2 />} />
                    <Route path={`/${encryptPath('po')}`} element={<PO />} />
                    <Route path={`/${encryptPath('maintenance2')}`} element={<Maintenance2 />} />
                    <Route path={`/${encryptPath('result')}`} element={<Result />} />
                    <Route path={`/${encryptPath('approval3')}`} element={<Approval3 />} />

                    {/* New routes for complete flowchart compliance */}
                    <Route path={`/${encryptPath('aset')}`} element={<Aset />} />
                    <Route path={`/${encryptPath('asset baru')}`} element={<AssetBaru />} />
                    <Route
                      path={`/${encryptPath('form personal id')}`}
                      element={<FormPersonalID />}
                    />
                    <Route path={`/${encryptPath('ticket created')}`} element={<TicketCreated />} />
                    <Route path={`/${encryptPath('finish')}`} element={<Finish />} />
                    <Route
                      path={`/${encryptPath('request created')}`}
                      element={<RequestCreated />}
                    />
                    <Route path={`/${encryptPath('new request')}`} element={<NewRequest />} />
                    <Route path={`/${encryptPath('delivery')}`} element={<Delivery />} />
                    <Route
                      path={`/${encryptPath('dashboard maintenance')}`}
                      element={<DashboardMaintenance />}
                    />
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
                    <Route
                      path={`/${encryptPath('user management')}`}
                      element={<UserManagement />}
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
    </ErrorBoundary>
  );
});

export default App;
