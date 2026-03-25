-- Migration: Rename asset_id to it_item_id in maintenance_plans table
-- This migration changes the asset_id column to it_item_id to better reflect that it references IT Item

-- Rename the column from asset_id to it_item_id
EXEC sp_rename 'maintenance_plans.asset_id', 'it_item_id', 'COLUMN';

PRINT 'Migration completed: asset_id column renamed to it_item_id';

