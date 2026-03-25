-- =====================================================
-- Migration: Seed asset_status Master Table
-- Description: Insert default data jika belum ada
-- =====================================================

-- Check if data already exists
IF NOT EXISTS (SELECT * FROM asset_status)
BEGIN
    -- Insert default status data
    INSERT INTO asset_status (status_name, status_description, is_active, is_disposed, display_order)
    VALUES 
        ('Active', 'Asset aktif dan dapat digunakan', 1, 0, 1),
        ('Inactive', 'Asset tidak aktif/suspended', 1, 0, 2),
        ('In Repair', 'Asset sedang dalam perbaikan', 1, 0, 3),
        ('Disposed', 'Asset sudah di Dispose', 1, 1, 4);

    PRINT 'Default status data inserted.';
END
ELSE
BEGIN
    PRINT 'Status data already exists. Skipping insert.';
END
GO

-- =====================================================
-- Add status_id to it_items (if not exists)
-- =====================================================

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('it_items') AND name = 'status_id'
)
BEGIN
    ALTER TABLE it_items ADD status_id INT NULL;
    
    ALTER TABLE it_items 
    ADD CONSTRAINT FK_it_items_asset_status 
    FOREIGN KEY (status_id) REFERENCES asset_status(status_id);
    
    CREATE NONCLUSTERED INDEX IX_it_items_status_id ON it_items(status_id);

    -- Backfill from existing current_status
    UPDATE i
    SET i.status_id = s.status_id
    FROM it_items i
    INNER JOIN asset_status s ON i.current_status = s.status_name
    WHERE i.status_id IS NULL AND i.current_status IS NOT NULL;

    PRINT 'status_id column added to it_items.';
END
GO

PRINT 'Migration completed.';

