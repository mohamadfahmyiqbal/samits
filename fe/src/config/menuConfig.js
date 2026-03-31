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
        label: 'Stock List',
        path: 'stock-list',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Part Category',
        path: 'part-category',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Minimum Stock',
        path: 'minimum-stock',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Add Stock',
        path: 'add-stock',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Stok Kontrol',
        path: 'stok-kontrol',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        type: 'nested',
        label: 'Parts & Vendors',
        id: 'parts-vendors-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
        items: [
          {
            label: 'Parts Request',
            path: 'parts-request',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Vendor Assignments',
            path: 'vendor-assignments',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
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
  // Summary - semua role
  {
    type: 'link',
    label: 'Summary',
    path: 'summary',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
  },
];
