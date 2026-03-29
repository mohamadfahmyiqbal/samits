export const menuGroups = [
  // Dashboard - otomatis berdasarkan role user
  {
    type: 'link',
    label: 'Dashboard',
    path: 'dashboard',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
  },
  // Asset - menu utama untuk management aset
  {
    type: 'dropdown',
    label: 'Asset',
    id: 'asset-main-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'USER'],
    items: [
      {
        label: 'Asset List',
        path: 'asset list',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'USER'],
      },
    ],
  },
  // Asset List - administrator dan asset controller
  {
    type: 'dropdown',
    label: 'Asset List',
    id: 'asset-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
    items: [
      {
        label: 'Asset Management',
        path: 'asset management',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Data Pengguna',
        path: 'data pengguna',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
    ],
  },
  // Request Asset - user dan administrator
  {
    type: 'dropdown',
    label: 'Request Asset',
    id: 'request-asset-dropdown',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER'],
    items: [
      { label: 'New Request', path: 'new request', allowedRoles: ['SUPERADMIN', 'USER'] },
      { label: 'Request Aset', path: 'req aset', allowedRoles: ['SUPERADMIN', 'USER'] },
      { label: 'PV', path: 'pv', allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER'] },
      {
        label: 'Approval 2',
        path: 'approval2',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      { label: 'Purchase Order', path: 'po', allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'] },
      {
        label: 'Delivery & Distribusi',
        path: 'delivery distribusi',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      { label: 'Invoice', path: 'invoice', allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'] },
    ],
  },
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
        path: 'breakdown log',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      {
        label: 'Inspection Reports',
        path: 'inspection reports',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      {
        type: 'nested',
        label: 'Preventive',
        id: 'preventive-nested',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
        items: [
          { label: 'Schedule', path: 'schedule', allowedRoles: ['SUPERADMIN', 'MAINTENANCE'] },
          {
            label: 'Pilih Category',
            path: 'pilih category',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Pilih Schedule',
            path: 'pilih schedule',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Maintenance Schedule',
            path: 'maintenance schedule',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Maintenance 2',
            path: 'maintenance2',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'PM Task / Checklist',
            path: 'pm-task',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'PM Calendar',
            path: 'pm-calendar',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'PM History',
            path: 'pm-history',
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
            path: 'corrective action',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Approval 3',
            path: 'approval3',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
        ],
      },
      {
        type: 'nested',
        label: 'Parts & Vendors',
        id: 'parts-vendors-nested',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
        items: [
          {
            label: 'Parts Request',
            path: 'parts request',
            allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
          },
          {
            label: 'Vendor Assignments',
            path: 'vendor assignments',
            allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER', 'MAINTENANCE'],
          },
        ],
      },
      {
        label: 'SLA Dashboard',
        path: 'sla dashboard',
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
        path: 'stock list',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Part Category',
        path: 'part category',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Minimum Stock',
        path: 'minimum stock',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Add Stock',
        path: 'add stock',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Stok Kontrol',
        path: 'stok kontrol',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
    ],
  },
  // Dispose & Update - finance terkait, administrator
  {
    type: 'dropdown',
    label: 'Dispose & Update',
    id: 'dispose-update-dropdown',
    allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
    items: [
      {
        label: 'List Depresiasi',
        path: 'list depresiasi',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      {
        label: 'Berita Acara',
        path: 'berita acara',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      { label: 'Finance 2', path: 'finance2', allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'] },
    ],
  },
  // Approval System - semua role bisa lihat tergantung approval
  {
    type: 'dropdown',
    label: 'Approval System',
    id: 'approval-system-dropdown',
    allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
    items: [
      {
        label: 'Approval System',
        path: 'approval system',
        allowedRoles: ['SUPERADMIN', 'USER', 'ASSET_CONTROLLER', 'MAINTENANCE', 'APPROVER'],
      },
      { label: 'User Approval', path: 'user approval', allowedRoles: ['SUPERADMIN'] },
      { label: 'Finance Approval', path: 'finance approval', allowedRoles: ['SUPERADMIN'] },
      {
        label: 'PD Approval',
        path: 'pd approval',
        allowedRoles: ['SUPERADMIN', 'ASSET_CONTROLLER'],
      },
      { label: 'Approval 4', path: 'approval4', allowedRoles: ['SUPERADMIN'] },
    ],
  },
  // Abnormality - maintenance dan administrator
  {
    type: 'dropdown',
    label: 'Abnormality',
    id: 'abnormality-dropdown',
    allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
    items: [
      {
        label: 'Abnormality Management',
        path: 'abnormality management',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      {
        label: 'Job Request 2',
        path: 'jobrequest2',
        allowedRoles: ['SUPERADMIN', 'MAINTENANCE'],
      },
      { label: 'Result 2', path: 'result2', allowedRoles: ['SUPERADMIN', 'MAINTENANCE'] },
    ],
  },
  // Finance - administrator saja
  {
    type: 'dropdown',
    label: 'Finance',
    id: 'finance-dropdown',
    allowedRoles: ['SUPERADMIN'],
    items: [
      { label: 'Finance', path: 'finance', allowedRoles: ['SUPERADMIN'] },
      { label: 'Finance 2', path: 'finance2', allowedRoles: ['SUPERADMIN'] },
    ],
  },
  // User Management - administrator saja
  {
    type: 'link',
    label: 'User Management',
    path: 'user management',
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
