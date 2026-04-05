-- Migration: Update maintenance_plans table to support schedule maintenance
-- Run this SQL query to add necessary columns for schedule maintenance

ALTER TABLE maintenance_plans
ADD scheduled_date DATE NULL;

ALTER TABLE maintenance_plans
ADD scheduled_end_date DATE NULL;

ALTER TABLE maintenance_plans
ADD pic VARCHAR(100) NULL;

ALTER TABLE maintenance_plans
ADD status VARCHAR(20) NULL DEFAULT 'pending';

ALTER TABLE maintenance_plans
ADD description TEXT NULL;

ALTER TABLE maintenance_plans
ADD category VARCHAR(50) NULL;

ALTER TABLE maintenance_plans
ADD maintenance_type VARCHAR(100) NULL;

ALTER TABLE maintenance_plans
ADD hostname VARCHAR(100) NULL;

ALTER TABLE maintenance_plans
ADD created_by VARCHAR(100) NULL;

ALTER TABLE maintenance_plans
ADD created_at DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE maintenance_plans
ADD updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Set default status values
EXEC sp_addextendedproperty 
    @name = N'Description', 
    @value = N'Maintenance schedule table with full schedule support',
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'maintenance_plans';

-- Optional: Create index for better query performance
CREATE INDEX IX_maintenance_plans_scheduled_date 
ON maintenance_plans(scheduled_date);

CREATE INDEX IX_maintenance_plans_status 
ON maintenance_plans(status);

CREATE INDEX IX_maintenance_plans_asset_id 
ON maintenance_plans(asset_id);

PRINT 'Migration completed: maintenance_plans table updated successfully';

