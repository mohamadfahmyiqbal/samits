export const menuGroups = [
  // Dashboard - otomatis berdasarkan role user
  {
    type: 'link',
    label: 'Dashboard',
    path: 'dashboard',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
  },
  // Asset List - administrator dan asset controller
  {
    type: 'dropdown',
    label: 'Asset Management',
    id: 'asset-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
    items: [
      {
        label: 'Asset List',
        path: 'asset-management',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Data Pengguna',
        path: 'data-pengguna',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'List Depresiasi',
        path: 'data-pengguna',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
    ],
  },
  
  // Service Desk - ITSM (Service Request & Incident)
  
  // Maintenance - maintenance dan administrator
  {
    type: 'dropdown',
    label: 'Maintenance',
    id: 'maintenance-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
    items: [
      { label: 'Work Order', path: 'workorder', allowedRoles: ['SUPERADMIN', 'MAINTENANCE'] },
      {
        label: 'Breakdown Log',
        path: 'breakdown-log',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      {
        label: 'Inspection Reports',
        path: 'inspection-reports',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      {
        type: 'nested',
        label: 'Preventive',
        id: 'preventive-nested',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
        items: [
          {
            label: 'Maintenance Schedule',
            path: 'maintenance-schedule',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Preventive Reports',
            path: 'maintenance2',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Checksheet',
            path: 'preventive-checksheet',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
        ],
      },
      {
        type: 'nested',
        label: 'Corrective',
        id: 'corrective-nested',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
        items: [
          { label: 'Result', path: 'result', allowedRoles: ['SUPERADMIN', 'MAINTENANCE'] },
          {
            label: 'Corrective Action',
            path: 'corrective-action',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Maintenance Approval',
            path: 'approval3',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
        ],
      },
      {
        label: 'SLA Dashboard',
        path: 'sla-dashboard',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
    ],
  },
  // Stock Control - asset controller dan administrator
  {
    type: 'dropdown',
    label: 'Stock Control',
    id: 'stock-control-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
    items: [
      {
        label: 'Dashboard',
        path: 'stock-control',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        type: 'nested',
        label: 'Inventory',
        id: 'inventory-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
        items: [
          {
            label: 'Stock List',
            path: 'add-stock',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },

          {
            label: 'Stock Movement',
            path: 'stock-movement',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
          {
            label: 'Stock Opname',
            path: 'stock-opname',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
        ],
      },
      {
        type: 'nested',
        label: 'Master Data',
        id: 'master-data-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
        items: [
          {
            label: 'Part Category',
            path: 'part-category',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
          {
            label: 'Vendors',
            path: 'vendors',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
          {
            label: 'Minimum Stock Rules',
            path: 'minimum-stock',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
        ],
      },
      
      {
        type: 'nested',
        label: 'Requests',
        id: 'requests-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
        items: [
          {
            label: 'Parts Request',
            path: 'parts-request',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Reorder / Purchase',
            path: 'reorder-request',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
        ],
      },
      {
        type: 'nested',
        label: 'Reports',
        id: 'reports-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
        items: [
          {
            label: 'Summary Stock',
            path: 'summary-stock',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
          {
            label: 'Usage Report',
            path: 'usage-report',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
          {
            label: 'Dead Stock Report',
            path: 'dead-stock-report',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
          },
        ],
      },
    ],
  },
  // Dispose & Update - finance terkait, administrator
  
  // Approval System - semua role bisa lihat tergantung approval
  // User Management - administrator saja
  {
    type: 'link',
    label: 'User Management',
    path: 'user-management',
    allowedRoles: ['SUPERADMIN'],
  },
  // Summary - semua role (dengan submenus)
  {
    type: 'dropdown',
    label: 'Summary',
    id: 'summary-dropdown',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
    items: [
      {
        label: 'Summary Asset',
        path: 'summary-asset',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER']
      },
      {
        label: 'Summary Maintenance', 
        path: 'summary-maintenance',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE']
      },
      {
        label: 'Summary Stock',
        path: 'summary-stock',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER']
      }
    ]
  },
];

