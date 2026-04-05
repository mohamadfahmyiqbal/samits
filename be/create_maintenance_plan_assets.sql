-- Create missing maintenance_plan_assets table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='maintenance_plan_assets' AND xtype='U')
BEGIN
    CREATE TABLE maintenance_plan_assets (
        id INT PRIMARY KEY IDENTITY(1,1),
        plan_id INT NOT NULL,
        it_item_id UNIQUEIDENTIFIER NULL,
        hostname VARCHAR(100) NULL,
        asset_tag VARCHAR(100) NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
    );
    
    PRINT 'maintenance_plan_assets table created successfully!';
END
ELSE
BEGIN
    PRINT 'maintenance_plan_assets table already exists.';
END;
