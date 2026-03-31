// routes/index.js
import { lazy } from 'react';

// Core pages - ONLY WORKING ONES FOR NOW
export const coreRoutes = [
  {
    path: 'dashboard',
    component: lazy(() => import('../pages/DashboardScreen/DashboardScreen')),
  },
];

// Asset management routes - ONLY WORKING ONES
export const assetRoutes = [
  {
    path: 'asset-management',
    component: lazy(() => import('../pages/AssetManagement/AssetManagementPage')),
  },
  {
    path: 'hardware',
    component: lazy(() => import('../pages/AssetHardware/AssetHardware')),
  },
  {
    path: 'software',
    component: lazy(() => import('../pages/AssetSoftware/AssetSoftware')),
  },
  {
    path: 'infrastruktur',
    component: lazy(() => import('../pages/Infrastructure/Infrastructure')),
  },
  {
    path: 'summary',
    component: lazy(() => import('../pages/Summary')),
  },
];

// Maintenance routes - ONLY WORKING ONES
export const maintenanceRoutes = [
  {
    path: 'maintenance-schedule',
    component: lazy(() => import('../pages/MaintenanceSchedule/MaintenanceSchedule')),
  },
  {
    path: 'schedule',
    component: lazy(() => import('../pages/MaintenanceScreen/pages/Schedule')),
  },
  {
    path: 'pm-schedule',
    component: lazy(() => import('../pages/MaintenanceScreen/pages/PMSchedule')),
  },
  {
    path: 'pm-task',
    component: lazy(() => import('../pages/MaintenanceScreen/pages/PMTask')),
  },
  {
    path: 'pm-calendar',
    component: lazy(() => import('../pages/MaintenanceScreen/pages/PMCalendar')),
  },
  {
    path: 'pm-history',
    component: lazy(() => import('../pages/MaintenanceScreen/pages/PMHistory')),
  },
  {
    path: 'workorder',
    component: lazy(() => import('../pages/WorkOrderScreen/index.js')),
  },
  {
    path: 'preventive-checksheet',
    component: lazy(() => import('../pages/MaintenanceChecksheet/MaintenanceChecksheet.jsx')),
  },
];

// Stock management routes - ONLY WORKING ONES
export const stockRoutes = [
  {
    path: 'stok-kontrol',
    component: lazy(() => import('../pages/StokKontrol')),
  },
];

// User management routes - ONLY WORKING ONES
export const userRoutes = [
  {
    path: 'user-management',
    component: lazy(() => import('../pages/UserManagement/UserManagement')),
  },
  {
    path: 'breakdown-log',
    component: lazy(() => import('../pages/BreakdownLog/BreakdownLog')),
  },
  {
    path: 'inspection-reports',
    component: lazy(() => import('../pages/InspectionReports/InspectionReports')),
  },
  {
    path: 'parts-request',
    component: lazy(() => import('../pages/PartsRequest/PartsRequest')),
  },
  {
    path: 'vendor-assignments',
    component: lazy(() => import('../pages/VendorAssignments/VendorAssignments')),
  },
  {
    path: 'sla-dashboard',
    component: lazy(() => import('../pages/SLADashboard/SLADashboard')),
  },
];

// Combine all working routes
export const allRoutes = [
  ...coreRoutes,
  ...assetRoutes,
  ...maintenanceRoutes,
  ...stockRoutes,
  ...userRoutes,
];
