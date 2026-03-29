-- Simple migration script for new maintenance fields
USE [your_database_name];

-- Add new columns if they don't exist
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'maintenance_plans' AND COLUMN_NAME = 'priority')
BEGIN
    ALTER TABLE maintenance_plans ADD priority VARCHAR(20) DEFAULT 'medium';
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'maintenance_plans' AND COLUMN_NAME = 'criticality')
BEGIN
    ALTER TABLE maintenance_plans ADD criticality VARCHAR(20) DEFAULT 'medium';
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'maintenance_plans' AND COLUMN_NAME = 'location')
BEGIN
    ALTER TABLE maintenance_plans ADD location VARCHAR(200);
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'maintenance_plans' AND COLUMN_NAME = 'required_skills')
BEGIN
    ALTER TABLE maintenance_plans ADD required_skills NVARCHAR(MAX);
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'maintenance_plans' AND COLUMN_NAME = 'estimated_duration')
BEGIN
    ALTER TABLE maintenance_plans ADD estimated_duration DECIMAL(4,2) DEFAULT 2.0;
END;

PRINT 'Migration completed successfully!';
