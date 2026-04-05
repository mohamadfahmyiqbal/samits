// Fallback data constants for MaintenanceSchedule component
export const FALLBACK_MAINTENANCE_TEAM = [
  { nik: '12345', name: 'John Doe', display_name: 'John Doe (12345)' },
  { nik: '67890', name: 'Jane Smith', display_name: 'Jane Smith (67890)' },
  { nik: '11111', name: 'Mike Johnson', display_name: 'Mike Johnson (11111)' },
];

export const FALLBACK_MAIN_TYPES = [
  { asset_main_type_id: 1, main_type_name: 'IT Infrastructure' },
  { asset_main_type_id: 2, main_type_name: 'Network Equipment' },
  { asset_main_type_id: 3, main_type_name: 'Server' },
  { asset_main_type_id: 4, main_type_name: 'Storage' },
  { asset_main_type_id: 5, main_type_name: 'Security' },
  { asset_main_type_id: 6, main_type_name: 'Facility' },
];

export const FALLBACK_CATEGORIES = [
  { category: 'Preventive Maintenance', category_id: 1, sub_categories: [] },
  { category: 'Corrective Maintenance', category_id: 2, sub_categories: [] },
  { category: 'Predictive Maintenance', category_id: 3, sub_categories: [] },
  { category: 'Emergency Maintenance', category_id: 4, sub_categories: [] },
];

export const FALLBACK_SUBCATEGORIES = [
  { sub_category_id: 1, sub_category_name: 'Equipment Inspection' },
  { sub_category_id: 2, sub_category_name: 'Lubrication' },
  { sub_category_id: 3, sub_category_name: 'Calibration' },
  { sub_category_id: 4, sub_category_name: 'Cleaning' },
  { sub_category_id: 5, sub_category_name: 'Hardware Repair' },
  { sub_category_id: 6, sub_category_name: 'Software Update' },
  { sub_category_id: 7, sub_category_name: 'Network Configuration' },
  { sub_category_id: 8, sub_category_name: 'Security Audit' },
];

// Date constants
export const WEEK_STARTS_ON = 1; // Monday
export const DEFAULT_ESTIMATED_DURATION = 2;
export const DEBOUNCE_DELAY = 300; // milliseconds
