-- Migration: Alter asset_id column to varchar to accommodate string values like 'BELUM AKUISISI'
-- This is needed because frontend sends noAsset (string) instead of asset_id (int)

ALTER TABLE maintenance_plans
ALTER COLUMN asset_id VARCHAR(50) NOT NULL;

PRINT 'Migration completed: asset_id column changed to VARCHAR(50)';

