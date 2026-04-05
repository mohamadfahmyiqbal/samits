-- Cek data CLIENT main_type dan sub_category Hardware
-- Jalankan di SQL Server Management Studio atau query tool

-- 1. Cari CLIENT main_type_id
SELECT asset_main_type_id, main_type_name 
FROM AssetMainType 
WHERE main_type_name LIKE '%CLIENT%' OR main_type_name = 'CLIENT';

-- 2. Cari Hardware sub_category di CLIENT category
SELECT 
  c.asset_main_type_id,
  c.it_category_id,
  c.category_name,
  s.sub_category_id,
  s.sub_category_name
FROM ITCategory c
JOIN ITSubCategory s ON c.it_category_id = s.it_category_id
WHERE c.asset_type LIKE '%CLIENT%' 
  OR s.sub_category_name LIKE '%HARDWARE%'
  OR c.category_name LIKE '%HARDWARE%';

-- 3. Count asset CLIENT total
SELECT 
  asset_main_type_id,
  COUNT(*) as total_assets
FROM ITItem 
WHERE asset_main_type_id IS NOT NULL
GROUP BY asset_main_type_id
ORDER BY total_assets DESC;

-- 4. Asset CLIENT dengan Hardware sub_category (ganti CLIENT_ID dan HARDWARE_SUB_ID dari query 1-2)
-- SELECT i.*, s.sub_category_name 
-- FROM ITItem i 
-- JOIN ITSubCategory s ON i.sub_category_id = s.sub_category_id
-- WHERE i.asset_main_type_id = CLIENT_ID 
--   AND s.sub_category_name LIKE '%HARDWARE%'
-- ORDER BY i.asset_tag;

-- 5. Sample data CLIENT assets
SELECT TOP 5 
  i.asset_tag, 
  i.asset_main_type_id,
  mt.main_type_name,
  i.category_id,
  i.sub_category_id,
  s.sub_category_name
FROM ITItem i
LEFT JOIN AssetMainType mt ON i.asset_main_type_id = mt.asset_main_type_id
LEFT JOIN ITSubCategory s ON i.sub_category_id = s.sub_category_id
WHERE i.asset_main_type_id = 2  -- Ganti dengan CLIENT_ID dari query 1
ORDER BY i.created_at DESC;

