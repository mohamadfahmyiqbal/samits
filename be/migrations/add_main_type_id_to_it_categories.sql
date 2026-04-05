-- Migration: Add main_type_id column to it_categories table
-- This column links categories to asset_main_types

-- 1. Add the main_type_id column if it doesn't exist
ALTER TABLE it_categories 
ADD COLUMN IF NOT EXISTS main_type_id INT NULL;

-- 2. Add foreign key constraint (optional - only if you want strict referential integrity)
-- ALTER TABLE it_categories 
-- ADD CONSTRAINT fk_it_categories_main_type 
-- FOREIGN KEY (main_type_id) REFERENCES asset_main_types(asset_main_type_id);

-- 3. Example: Update existing categories to link to main types
-- UPDATE it_categories 
-- SET main_type_id = 1 
-- WHERE category_name IN ('Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Printer');

-- 4. Verify the column was added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'it_categories' AND column_name = 'main_type_id';

