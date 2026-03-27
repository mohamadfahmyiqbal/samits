-- Migration: Add it_item_id + make asset_id nullable untuk WorkOrder
-- Production ready SQL Server

BEGIN TRANSACTION;

-- 1. Tambah kolom it_item_id (UUID nullable)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.work_orders') AND name = 'it_item_id')
BEGIN
    ALTER TABLE dbo.work_orders 
    ADD it_item_id NVARCHAR(36) NULL;
    
    PRINT '✅ Added it_item_id column';
END

-- 2. Update existing records dengan it_item_id dari MaintenancePlan → ITItem
UPDATE wo 
SET wo.it_item_id = mp.it_item_id
FROM dbo.work_orders wo
INNER JOIN dbo.maintenance_plans mp ON wo.plan_id = mp.plan_id
INNER JOIN dbo.it_items ii ON mp.it_item_id = ii.it_item_id
WHERE wo.it_item_id IS NULL;

PRINT '✅ Backfilled it_item_id for existing work orders';

-- 3. Make asset_id nullable (remove NOT NULL constraint)
IF EXISTS (
    SELECT 1 
    FROM sys.objects o 
    INNER JOIN sys.columns c ON o.object_id = c.object_id 
    WHERE o.name = 'work_orders' AND c.name = 'asset_id' 
    AND c.is_nullable = 0
)
BEGIN
    ALTER TABLE dbo.work_orders 
    ALTER COLUMN asset_id BIGINT NULL;
    
    PRINT '✅ Made asset_id nullable';
END

-- 4. Tambah index untuk query performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_work_orders_it_item_id' AND object_id = OBJECT_ID('dbo.work_orders'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_work_orders_it_item_id 
    ON dbo.work_orders (it_item_id);
    
    PRINT '✅ Added index on it_item_id';
END

COMMIT TRANSACTION;

PRINT '✅ Migration completed successfully. Test dengan: SELECT TOP 5 * FROM work_orders WHERE it_item_id IS NOT NULL';
