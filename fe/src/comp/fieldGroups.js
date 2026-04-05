// Field groupings for better organization in ModalDetail
export const fieldGroups = {
  'Informasi Utama': [
    'noAsset',
    'asset_id',
    'it_item_id',
    'asset_tag',
    'accounting_asset_no',
    'type',
    'category',
    'classification',
    'assetGroup',
  ],
  'Detail Lokasi & Pemilik': [
    'location',
    'dept',
    'department',
    'nama',
    'nik',
    'assigned_to',
    'vendor',
    'hostname',
    'divisi',
  ],
  'Informasi Keuangan': [
    'purchase_price',
    'harga',
    'purchase_date',
    'warranty_expiry',
    'tahunBeli',
    'po_date_period',
    'inspection_date_period',
    'depreciation_end_date',
    'acquisition_status',
    'useful_life_year',
    'extend_warranty_date',
  ],
  Jaringan: ['ip_address', 'mac_address'],
  Status: ['status', 'current_status', 'is_disposed', 'status_history', 'status_changed_at'],
  'Informasi Tambahan': [
    'serial_number',
    'description',
    'keterangan',
    'invoice_number',
    'po_number',
    'no_cip',
    'created_at',
    'updated_at',
  ],
  'Reference IDs': ['sub_category_id', 'category_id', 'classification_id'],
};

// Get all field names from groups
export const allGroupedFields = Object.values(fieldGroups).flat();
