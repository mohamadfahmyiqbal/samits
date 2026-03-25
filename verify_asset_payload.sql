-- VERIFY ASSET PAYLOAD PROCESSING
-- Jalankan setelah create/update asset untuk cek semua fields tersimpan

-- 1. CORE ASSET DATA (ITItem)
SELECT 
  'ITItem' as table_name,
  it_item_id,
  asset_tag as noAsset,
  current_status as status,
  sub_category_id,
  category_id,
  classification_id,
  asset_main_type_id,
  asset_group_id,
  po_date_period as tahunBeli,
  useful_life_year as tahunDepreciation,
  po_number,
  purchase_price_actual,
  acquisition_status
FROM ITItem 
WHERE asset_tag = 'YOUR_ASSET_NO_HERE';  -- Ganti dengan noAsset yang dibuat

-- 2. ASSIGNMENT (NIK/Dept)
SELECT 
  'ITItemAssignment' as table_name,
  nik,
  assigned_at,
  it_item_id
FROM ITItemAssignment 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE');

-- 3. NETWORK (Hostname + IP)
SELECT 
  'ITItemNetwork' as table_name,
  hostname,
  ip_address,
  mac_address,
  is_primary
FROM ITItemNetwork 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE');

-- 4. NAMA ATTRIBUTE
SELECT 
  'ITItemAttribute' as table_name,
  attr_name,
  attr_value as nama,
  it_item_id
FROM ITItemAttribute 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
  AND attr_name = 'nama';

-- 5. DOCUMENTS
SELECT 
  'AssetDocument' as table_name,
  document_type,
  file_name,
  file_path,
  uploaded_by,
  it_item_id
FROM AssetDocument 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE');

-- 6. STATUS HISTORY
SELECT 
  'ITItemStatusHistory' as table_name,
  status,
  changed_at,
  it_item_id
FROM ITItemStatusHistory 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
ORDER BY changed_at DESC;

-- 7. AUDIT LOG
SELECT TOP 5
  'AssetAuditLog' as table_name,
  event_type,
  actor_nik,
  actor_name,
  after_data,
  event_at
FROM AssetAuditLog 
WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
ORDER BY event_at DESC;

-- SUMMARY: Hitung records per table
SELECT 
  'Summary' as table_name,
  COUNT(*) as records
FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE'
UNION ALL
SELECT 'ITItemAssignment', COUNT(*) FROM ITItemAssignment WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
UNION ALL
SELECT 'ITItemNetwork', COUNT(*) FROM ITItemNetwork WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
UNION ALL
SELECT 'AssetDocument', COUNT(*) FROM AssetDocument WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE')
UNION ALL
SELECT 'AuditLog', COUNT(*) FROM AssetAuditLog WHERE it_item_id IN (SELECT it_item_id FROM ITItem WHERE asset_tag = 'YOUR_ASSET_NO_HERE');
