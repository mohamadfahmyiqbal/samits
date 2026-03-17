// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import LoginScreen from "./pages/LoginScreen";
import DashboardScreen from "./pages/DashboardScreen";
import Hardware from "./pages/Hardware";
import Software from "./pages/Software";
import Schedule from "./pages/MaintenanceScreen/pages/Schedule";
import Summary from "./pages/Summarry"; // typo fixed
import AssetManagement from "./pages/AssetManagement/AssetManagementPage";
import Cyber from "./pages/Cyber";
import Infrastruktur from "./pages/Infrastruktur";
import StokKontrol from "./pages/StokKontrol";
import WorkOrderScreen from "./pages/WorkOrderScreen/index.js";
import PMSchedule from "./pages/MaintenanceScreen/pages/PMSchedule";
import PMTask from "./pages/MaintenanceScreen/pages/PMTask";
import PMCalendar from "./pages/MaintenanceScreen/pages/PMCalendar";
import PMHistory from "./pages/MaintenanceScreen/pages/PMHistory";

import ProtectedRoute from "./ProtectedRoute";
import { encryptPath } from "./router/encryptPath";
import MainLayout from "./layout/MainLayout";

import { AssetProvider } from "./context/AssetContext";
import { MaintenanceProvider } from "./context/MaintenanceContext";
import { SocketProvider } from "./context/SocketContext";


function App() {
  return (
    <SocketProvider>
      <AssetProvider>
        <MaintenanceProvider>
          <ToastContainer />
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path={`/${encryptPath("dashboard")}`} element={<DashboardScreen />} />
              <Route path={`/${encryptPath("hardware")}`} element={<Hardware />} />
              <Route path={`/${encryptPath("software")}`} element={<Software />} />
              <Route path={`/${encryptPath("schedule")}`} element={<Schedule />} />
              <Route path={`/${encryptPath("cyber")}`} element={<Cyber />} />
              <Route path={`/${encryptPath("infrastruktur")}`} element={<Infrastruktur />} />
              <Route path={`/${encryptPath("summary")}`} element={<Summary />} />
              <Route path={`/${encryptPath("asset management")}`} element={<AssetManagement />} />
              <Route
                path={`/${encryptPath("asset client")}`}
                element={<Navigate to={`/${encryptPath("asset management")}`} replace />}
              />
              <Route
                path={`/${encryptPath("asset utama")}`}
                element={<Navigate to={`/${encryptPath("asset management")}`} replace />}
              />
              <Route path={`/${encryptPath("stok kontrol")}`} element={<StokKontrol />} />
              <Route path={`/${encryptPath("pm-schedule")}`} element={<PMSchedule />} />
              <Route path={`/${encryptPath("pm-task")}`} element={<PMTask />} />
              <Route path={`/${encryptPath("pm-calendar")}`} element={<PMCalendar />} />
              <Route path={`/${encryptPath("pm-history")}`} element={<PMHistory />} />
              <Route path={`/${encryptPath("workorder")}`} element={<WorkOrderScreen />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </Router>
      </MaintenanceProvider>
    </AssetProvider>
    </SocketProvider>
  );
}

export default App;
