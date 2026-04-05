-- Migration: Add index untuk optimasi query listWorkOrders by created_at
-- Jalankan di SQL Server Management Studio atau sqlcmd

USE [your_database_name];  -- Ganti dengan nama database SAMIT

-- Cek apakah index sudah ada
IF NOT EXISTS (
    SELECT * 
    FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'work_orders') 
    AND name = N'IX_work_orders_created_at'
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_work_orders_created_at 
    ON work_orders (created_at DESC)
    INCLUDE (status, priority, wo_id, title);  -- Covering index untuk SELECT frequent columns
    
    PRINT '✅ Index IX_work_orders_created_at created successfully';
END
ELSE
BEGIN
    PRINT 'ℹ️ Index IX_work_orders_created_at already exists';
END

-- Verify index created
SELECT 
    i.name AS IndexName,
    c.name AS ColumnName,
    ips.avg_fragmentation_in_percent
FROM sys.dm_db_index_physical_stats(DB_ID(), OBJECT_ID('work_orders'), NULL, NULL, 'DETAILED') ips
JOIN sys.indexes i ON ips.object_id = i.object_id AND ips.index_id = i.index_id
JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID('work_orders')
ORDER BY i.name, ic.key_ordinal;

