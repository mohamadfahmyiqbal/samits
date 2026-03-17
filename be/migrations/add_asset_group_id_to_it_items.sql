-- Migration: Add asset_group_id column to it_items table
-- Date: 2025-01-01
-- Description: Menambahkan kolom asset_group_id untuk relasi dengan it_asset_groups

-- 1. Add column asset_group_id to it_items table (nullable first)
ALTER TABLE it_items 
ADD asset_group_id INT NULL;

-- 2. Create index for foreign key performance
CREATE NONCLUSTERED INDEX IX_it_items_asset_group_id 
ON it_items(asset_group_id);

-- 3. Add foreign key constraint (optional - uncomment if needed)
-- ALTER TABLE it_items 
-- ADD CONSTRAINT FK_it_items_asset_group_id 
-- FOREIGN KEY (asset_group_id) REFERENCES it_asset_groups(asset_group_id);

-- 4. Backfill existing data - map based on sub_category_id
-- This will map each item to its corresponding asset_group based on sub_category
UPDATE it_items
SET it_items.asset_group_id = agg.asset_group_id
FROM it_items it
INNER JOIN it_asset_groups agg ON agg.sub_category_id = it.sub_category_id
WHERE it_items.it_item_id = it.it_item_id
AND it.asset_group_id IS NULL;

-- 5. If there are items without matching asset_group, set default
-- Option A: Set to 1 (default group) if you have a default record
-- UPDATE it_items SET asset_group_id = 1 WHERE asset_group_id IS NULL;

-- Option B: Keep as NULL for unassigned items
-- (No action needed - NULL is allowed)

