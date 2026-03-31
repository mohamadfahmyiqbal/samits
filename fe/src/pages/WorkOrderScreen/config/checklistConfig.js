// Structured checklist registry for Work Order start flows

const CCTV_OUTDOOR_ITEMS = [
  {
    no: 1,
    description: 'Cek kondisi bracket & housing CCTV',
    range: 'Bracket & housing harus dalam kondisi tidak rusak dan menutupi kamera sepenuhnya.',
  },
  {
    no: 2,
    description: 'Cek kebersihan bagian luar & dalam perangkat',
    range: 'Perangkat harus bersih, tidak kotor, dan bebas debu ketika dilihat dari luar maupun dalam.',
  },
  {
    no: 3,
    description: 'Cek kondisi fisik kabel jaringan dari CCTV ke switch panel rack',
    range: 'Kabel tidak rusak, konektor terpasang dengan kuat, serta 8-core PIN menyala seluruhnya.',
  },
  {
    no: 4,
    description: 'Cek indikator LED Power & Ethernet',
    range: 'LED Power & Ethernet menyala hijau dan melakukan blinking sesuai indikator normal.',
  },
];

export const DEFAULT_CHECKLIST_CATALOG = [
  {
    id: 'hardware-cctv-outdoor',
    category: 'Hardware',
    subCategory: 'CCTV Outdoor',
    categoryIds: [109],
    subCategoryIds: [47],
    mainTypeIds: [30],
    matches: (category, subCategory) => {
      const cat = String(category || '').trim().toLowerCase();
      const sub = String(subCategory || '').trim().toLowerCase();
      return cat === 'hardware' && sub.includes('cctv');
    },
    items: CCTV_OUTDOOR_ITEMS,
  },
];
