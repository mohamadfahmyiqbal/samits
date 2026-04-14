export const fieldGroups = {
  Umum: ['noAsset', 'asset_tag', 'asset_id', 'it_item_id', 'assetGroup', 'status'],
  Identitas: ['nama', 'nik', 'dept', 'divisi', 'department'],
  Jaringan: [
    'hostname',
    'ip_address',
    'mac_address',
    'mainIpAdress',
    'backupIpAdress',
    'mainIpAddress',
    'backupIpAddress',
  ],
  Keuangan: [
    'purchase_price',
    'purchase_price_plan',
    'purchase_price_actual',
    'invoice_number',
    'po_number',
    'no_cip',
  ],
  Siklus_Aset: [
    'purchase_date',
    'tahunBeli',
    'depreciation_end_date',
    'extend_warranty_date',
    'acquisition_status',
    'useful_life_year',
  ],
};

export const allGroupedFields = Object.values(fieldGroups).flat();
