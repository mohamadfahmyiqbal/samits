-- ============================================
-- CHECK WORK ORDER DATABASE QUERIES
-- Run these queries in SQL Server Management Studio
-- ============================================

-- 1. CHECK IF WORK_ORDER TABLE EXISTS
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('work_orders', 'wo_assignments', 'maintenance_plans', 'ititems');

-- 2. COUNT TOTAL WORK ORDERS BY STATUS
SELECT 
    status,
    COUNT(*) as total
FROM work_orders
GROUP BY status
ORDER BY total DESC;

-- 3. LIST ALL WORK ORDERS WITH ASSIGNMENTS
SELECT 
    wo.wo_id,
    wo.title,
    wo.status,
    wo.priority,
    wo.it_item_id,
    wo.scheduled_date,
    wo.created_at,
    woa.nik as assigned_technician,
    woa.assigned_date
FROM work_orders wo
LEFT JOIN wo_assignments woa ON wo.wo_id = woa.wo_id
ORDER BY wo.created_at DESC;

-- 4. LIST WORK ORDERS WITH ASSET INFO
SELECT 
    wo.wo_id,
    wo.title,
    wo.status,
    ii.asset_tag,
    ii.it_item_id,
    mp.plan_name
FROM work_orders wo
LEFT JOIN ititems ii ON wo.it_item_id = ii.it_item_id
LEFT JOIN maintenance_plans mp ON wo.plan_id = mp.plan_id
ORDER BY wo.created_at DESC;

-- 5. CHECK TECHNICIANS (FROM WO_ASSIGNMENTS)
SELECT 
    nik as technician_id,
    COUNT(*) as total_assignments,
    MIN(assigned_date) as first_assigned,
    MAX(assigned_date) as last_assigned
FROM wo_assignments
GROUP BY nik
ORDER BY total_assignments DESC;

-- 6. CHECK RECENT WORK ORDERS (Last 7 days)
SELECT 
    wo_id,
    title,
    status,
    priority,
    created_at
FROM work_orders
WHERE created_at >= DATEADD(day, -7, GETDATE())
ORDER BY created_at DESC;

-- 7. CHECK WORK ORDERS WITHOUT ASSIGNMENTS
SELECT 
    wo.wo_id,
    wo.title,
    wo.status,
    wo.created_at
FROM work_orders wo
LEFT JOIN wo_assignments woa ON wo.wo_id = woa.wo_id
WHERE woa.wo_id IS NULL
ORDER BY wo.created_at DESC;

-- 8. CHECK TABLE SCHEMA
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'work_orders'
ORDER BY ORDINAL_POSITION;

-- 9. CHECK FOR DATA INTEGRITY ISSUES
-- Duplicate work order IDs
SELECT wo_id, COUNT(*) as duplicate_count
FROM work_orders
GROUP BY wo_id
HAVING COUNT(*) > 1;

-- 10. SAMPLE DATA CHECK (First 5 records)
SELECT TOP 5
    wo_id,
    title,
    description,
    status,
    priority,
    it_item_id,
    plan_id,
    scheduled_date,
    created_at,
    created_by
FROM work_orders
ORDER BY created_at DESC;
