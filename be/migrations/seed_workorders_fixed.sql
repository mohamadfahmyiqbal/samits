-- be/migrations/seed_workorders_fixed.sql
-- Fixed untuk IDENTITY column wo_id (auto-increment)

DECLARE @count INT = (SELECT COUNT(*) FROM work_orders);

IF @count = 0
BEGIN
    INSERT INTO work_orders (title, description, asset_id, status, priority, requested_by, request_date, category)
    VALUES 
    (N'PM Server Rack 01', N'Monthly preventive maintenance server rack', 1, N'open', N'medium', N'IT001', GETDATE(), N'preventive'),
    
    (N'AC Room Server Broken', N'Emergency repair AC unit room server', 5, N'in_progress', N'emergency', N'FM001', DATEADD(day, -1, GETDATE()), N'breakdown'),
    
    (N'Printer Maintenance', N'Quarterly service printer lantai 2', 10, N'completed', N'low', N'IT002', DATEADD(day, -7, GETDATE()), N'preventive'),
    
    (N'UPS Battery Test', N'Annual UPS battery capacity test', 3, N'open', N'high', N'ELEC001', GETDATE(), N'preventive');

    PRINT '✅ Inserted 4 sample work orders (wo_id auto-generated)';
END
ELSE
BEGIN
    PRINT '⏭️ Table already has data - Skipping seed';
END
