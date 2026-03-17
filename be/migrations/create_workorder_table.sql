-- be/migrations/create_workorder_table.sql
-- Production-ready WorkOrder table dengan best practices

CREATE TABLE work_orders (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NTEXT,
    asset_id BIGINT NOT NULL,
    status NVARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    priority NVARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
    assigned_to_nik NVARCHAR(20),
    category NVARCHAR(50),
    scheduled_date DATETIME2,
    completed_at DATETIME2,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Indexes untuk performance
CREATE INDEX IX_work_orders_status ON work_orders(status);
CREATE INDEX IX_work_orders_priority ON work_orders(priority);
CREATE INDEX IX_work_orders_asset_id ON work_orders(asset_id);
CREATE INDEX IX_work_orders_assigned_to_nik ON work_orders(assigned_to_nik);
CREATE INDEX IX_work_orders_scheduled_date ON work_orders(scheduled_date);

-- Foreign key dengan index
ALTER TABLE work_orders ADD CONSTRAINT FK_work_orders_asset_id 
FOREIGN KEY (asset_id) REFERENCES assets(id);
ALTER TABLE work_orders ADD CONSTRAINT FK_work_orders_assigned_to_nik 
FOREIGN KEY (assigned_to_nik) REFERENCES users(nik);

PRINT '✅ WorkOrder table created with indexes & FK constraints';
