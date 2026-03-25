// Asset Form Constants
export const initialAssetState = {
  noAsset: '',
  nama: '',
  // Hierarchy fields
  asset_main_type_id: '',
  asset_main_type_name: '',
  category: '',
  category_id: '',
  sub_category: '',
  sub_category_id: '',
  classification_id: '',
  // Asset Group
  assetGroup: '',
  asset_group_id: '',
  // Pemegang
  dept: '',
  nik: '',
  // Spesifikasi
  hostname: '',
  tahunBeli: '',
  type: '',
  tahunDepreciation: '',
  mainIpAdress: '',
  backupIpAdress: '',

  // Status & Pembelian
  status: 'Active',
  po_number: '',
  purchase_price_actual: '',
  invoice_number: '',
  // Fields baru dari database
  purchase_price_plan: '',
  depreciation_end_date: '',
  accounting_asset_no: '',
  acquisition_status: 'Planned',
  request_id: '',
};

// Default fallback options (will be replaced with API data)
export const defaultAssetGroupOptions = [
  // Wajib dimuat dari API (/api/assets/groups) agar sinkron dengan tabel it_asset_groups
];

// Default fallback status options (will be replaced with API data)
export const defaultStatusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'In Repair', label: 'In Repair' },
  { value: 'Disposed', label: 'Disposed' },
];

export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '6px',
    border: state.isFocused ? '1px solid #0b6bcb' : '1px solid #dcdcdc',
    boxShadow: 'none',
    minHeight: '36px',
    height: '36px',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0px 8px',
    height: '34px',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    lineHeight: '34px',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const formatRupiah = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  const number = raw.replace(/[^0-9]/g, '');
  if (!number) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export const validateAssetForm = (asset) => {
  const errors = {};
  
  if (!asset.noAsset?.trim()) {
    errors.noAsset = 'No. Asset wajib diisi';
  }
  if (!asset.nama?.trim()) {
    errors.nama = 'Nama Aset wajib diisi';
  }
  if (!asset.asset_main_type_id) {
    errors.asset_main_type_id = 'Main Type wajib dipilih';
  }
  if (!asset.category && !asset.category_id) {
    errors.category = 'Kategori wajib dipilih';
  }
  if (!asset.sub_category && !asset.sub_category_id) {
    errors.sub_category = 'Sub Kategori wajib dipilih';
  }
  // Asset Group sekarang optional - boleh dikosongkan
  // if (!asset.assetGroup) {
  //   errors.assetGroup = 'Asset Group wajib dipilih';
  // }
  
  // Validation for PC classification
  const isPC = (asset.sub_category?.toLowerCase() === 'pc') || 
               (asset.sub_category_name?.toLowerCase() === 'pc');
  if (isPC && !asset.classification_id) {
    errors.classification_id = 'Classification wajib dipilih untuk PC';
  }

  return errors;
};

