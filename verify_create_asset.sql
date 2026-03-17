-- VERIFY CREATE ASSET - Execute in SSMS (ganti YOUR_ASSET_NO)

DECLARE @AssetTag NVARCHAR(50) = 'YOUR_ASSET_NO'; -- Ganti dengan noAsset Anda

PRINT '=== 1. IT_ITEM MAIN ===';
SELECT * FROM MainPortal.dbo.it_items 
WHERE asset_tag = @AssetTag;

PRINT '=== 2. ASSIGNMENT ===';
SELECT * FROM MainPortal.dbo.it_item_assignments ia
JOIN MainPortal.dbo.it_items i ON ia.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag;

PRINT '=== 3. NETWORK ===';
SELECT * FROM MainPortal.dbo.it_item_networks n
JOIN MainPortal.dbo.it_items i ON n.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag;

PRINT '=== 4. ATTRIBUTES (nama) ===';
SELECT * FROM MainPortal.dbo.it_item_attributes a
JOIN MainPortal.dbo.it_items i ON a.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag AND a.attr_name = 'nama';

PRINT '=== 5. STATUS HISTORY ===';
SELECT TOP 5 * FROM MainPortal.dbo.it_item_status_history sh
JOIN MainPortal.dbo.it_items i ON sh.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag
ORDER BY sh.changed_at DESC;

PRINT '=== 6. AUDIT LOG ===';
SELECT TOP 5 * FROM MainPortal.dbo.asset_audit_logs al
JOIN MainPortal.dbo.it_items i ON al.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag AND al.event_type = 'CREATED'
ORDER BY al.event_at DESC;

PRINT '=== 7. DOCUMENTS ===';
SELECT * FROM MainPortal.dbo.asset_documents d
JOIN MainPortal.dbo.it_items i ON d.it_item_id = i.it_item_id
WHERE i.asset_tag = @AssetTag;

PRINT '=== SUMMARY ===';
SELECT 
  'IT_ITEMS' as table_name, COUNT(*) as count FROM MainPortal.dbo.it_items WHERE asset_tag = @AssetTag
UNION ALL
SELECT 'ASSIGNMENTS', COUNT(*) FROM MainPortal.dbo.it_item_assignments a JOIN MainPortal.dbo.it_items i ON a.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag
UNION ALL  
SELECT 'NETWORKS', COUNT(*) FROM MainPortal.dbo.it_item_networks n JOIN MainPortal.dbo.it_items i ON n.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag
UNION ALL
SELECT 'ATTRIBUTES', COUNT(*) FROM MainPortal.dbo.it_item_attributes a JOIN MainPortal.dbo.it_items i ON a.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag
UNION ALL
SELECT 'STATUS_HISTORY', COUNT(*) FROM MainPortal.dbo.it_item_status_history sh JOIN MainPortal.dbo.it_items i ON sh.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag
UNION ALL
SELECT 'AUDIT_LOGS', COUNT(*) FROM MainPortal.dbo.asset_audit_logs al JOIN MainPortal.dbo.it_items i ON al.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag
UNION ALL
SELECT 'DOCUMENTS', COUNT(*) FROM MainPortal.dbo.asset_documents d JOIN MainPortal.dbo.it_items i ON d.it_item_id = i.it_item_id WHERE i.asset_tag = @AssetTag;

