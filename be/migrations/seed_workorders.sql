-- be/migrations/seed_workorders.sql
-- Sample data untuk test WorkOrderScreen

DECLARE @count INT = (SELECT COUNT(*) FROM work_orders);

IF @count = 0
BEGIN
    INSERT INTO work_orders (wo_id, title, description, asset_id, status, priority, requested_by, request_date, category)
    VALUES 
    (1, N'PM Server Rack 01', N'Monthly preventive maintenance server rack', 1, N'open', N'medium', N'IT001', GETDATE(), N'preventive'),
    
    (2, N'AC Room Server Broken', N'Emergency repair AC unit room server', 5, N'in_progress', N'emergency', N'FM001', DATEADD(day, -1, GETDATE()), N'breakdown'),
    
    (3, N'Printer Maintenance', N'Quarterly service printer lantai 2', 10, N'completed', N'low', N'IT002', DATEADD(day, -7, GETDATE()), N'preventive'),
    
    (4, N'UPS Battery Test', N'Annual UPS battery capacity test', 3, N'open', N'high', N'ELEC001', GETDATE(), N'preventive');

    PRINT '✅ Inserted 4 sample work orders for testing';
END
ELSE
BEGIN
    PRINT '⏭️ Table already has data - Skipping seed';
END
