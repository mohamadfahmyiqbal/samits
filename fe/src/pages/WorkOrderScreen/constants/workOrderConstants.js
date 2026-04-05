// src/pages/WorkOrderScreen/constants/workOrderConstants.js
export const STATUS_ORDER = {
  'new': 0,
  'assigned': 1,
  'in_progress': 2,
  'completed': 3,
  'cancelled': 4
};

export const STATUS_BADGE_CONFIG = {
  'new': { bg: 'secondary', label: 'New' },
  'assigned': { bg: 'warning', label: 'Assigned' },
  'in_progress': { bg: 'primary', label: 'In Progress' },
  'completed': { bg: 'success', label: 'Completed' },
  'cancelled': { bg: 'danger', label: 'Cancelled' }
};

export const statusConfig = STATUS_BADGE_CONFIG;

export const PRIORITY_CONFIG = {
  'low': { bg: 'info', label: 'Low' },
  'medium': { bg: 'warning', label: 'Medium' },
  'high': { bg: 'danger', label: 'High' },
  'emergency': { bg: 'dark', label: 'Emergency' }
};

export const priorityColors = PRIORITY_CONFIG;

export const statusLabels = {
  'new': 'New',
  'assigned': 'Assigned',
  'in_progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled'
};

export const WO_TYPE_OPTIONS = [
  'PM - Preventive Maintenance',
  'CM - Corrective Maintenance', 
  'EM - Emergency Maintenance',
  'IM - Inspection Maintenance'
];
