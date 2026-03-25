-- be/migrations/alter_workorder_table_for_full_features.sql
-- Adapt existing work_orders table untuk service compatibility

ALTER TABLE work_orders 
ADD 
    title NVARCHAR(255),
    priority NVARCHAR(20) DEFAULT 'medium',
    assigned_to_nik NVARCHAR(20),
    category NVARCHAR(50),
    scheduled_date DATETIME2,
    completed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE();

-- Update primary key jika belum
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'PK_work_orders_wo_id' AND object_id = OBJECT_ID('work_orders'))
ALTER TABLE work_orders 
ADD CONSTRAINT PK_work_orders_wo_id PRIMARY KEY (wo_id);

-- Indexes untuk performance
CREATE INDEX IX_work_orders_status ON work_orders(status);
CREATE INDEX IX_work_orders_priority ON work_orders(priority);
CREATE INDEX IX_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX IX_work_orders_assigned_to_nik ON work_orders(assigned_to_nik);
CREATE INDEX IX_work_orders_scheduled_date ON work_orders(scheduled_date);

-- Foreign keys
ALTER TABLE work_orders ADD CONSTRAINT FK_work_orders_asset_id 
FOREIGN KEY (asset_id) REFERENCES assets(id);

ALTER TABLE work_orders ADD CONSTRAINT FK_work_orders_assigned_to_nik 
FOREIGN KEY (assigned_to_nik) REFERENCES users(nik);

PRINT '✅ work_orders table upgraded with full WorkOrderService compatibility';
