-- SQL Script untuk membuat tabel-tabel yang missing di database
-- Berdasarkan models yang ada di backend tapi tidak ada di database

-- ========================================
-- 1. USER MANAGEMENT TABLES
-- ========================================

-- Users table
CREATE TABLE users (
    nik VARCHAR(30) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(30),
    position VARCHAR(100),
    status VARCHAR(20),
    last_login DATETIME
);

-- Roles table
CREATE TABLE roles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- User Roles junction table
CREATE TABLE user_roles (
    id INT PRIMARY KEY IDENTITY(1,1),
    nik VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (nik) REFERENCES users(nik),
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    UNIQUE (nik, role_id)
);

-- Departments table
CREATE TABLE departments (
    department_id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    description VARCHAR(255)
);

-- Web Push Subscriptions table
CREATE TABLE webPushSubscriptions (
    id INT PRIMARY KEY IDENTITY(1,1),
    endpointHash VARCHAR(64) NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    p256dh TEXT,
    auth TEXT,
    contentEncoding VARCHAR(50),
    userNik VARCHAR(20),
    userId VARCHAR(100),
    userPosition VARCHAR(100),
    rawSubscription TEXT NOT NULL
);

-- ========================================
-- 2. MAINTENANCE FLOW TABLES
-- ========================================

-- Work Orders table
CREATE TABLE work_orders (
    wo_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    plan_id INT NOT NULL,
    description TEXT,
    asset_id BIGINT,
    it_item_id UNIQUEIDENTIFIER,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to_nik VARCHAR(20),
    category VARCHAR(50),
    scheduled_date DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Maintenance Plans table
CREATE TABLE maintenance_plans (
    plan_id INT PRIMARY KEY IDENTITY(1,1),
    it_item_id VARCHAR(50) NOT NULL,
    plan_name VARCHAR(150),
    schedule_rule VARCHAR(200),
    scheduled_date DATE
);

-- Maintenance Plan Assets table
CREATE TABLE maintenance_plan_assets (
    id INT PRIMARY KEY IDENTITY(1,1),
    plan_id INT NOT NULL,
    it_item_id UNIQUEIDENTIFIER NULL,
    hostname VARCHAR(100) NULL,
    asset_tag VARCHAR(100) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (plan_id) REFERENCES maintenance_plans(plan_id)
);

-- WO Assignments table
CREATE TABLE wo_assignments (
    id INT PRIMARY KEY IDENTITY(1,1),
    wo_id INT NOT NULL,
    nik VARCHAR(30) NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    assigned_by VARCHAR(30),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- WO Signatures table
CREATE TABLE wo_signatures (
    id INT PRIMARY KEY IDENTITY(1,1),
    wo_id INT NOT NULL,
    nik VARCHAR(30) NOT NULL,
    signature_image VARCHAR(500),
    signed_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- WO Task Results table
CREATE TABLE wo_task_results (
    id INT PRIMARY KEY IDENTITY(1,1),
    wo_id INT NOT NULL,
    task_name VARCHAR(255),
    result_description TEXT,
    completed_at DATETIME,
    completed_by VARCHAR(30),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- WO Timeline table
CREATE TABLE wo_timelines (
    id INT PRIMARY KEY IDENTITY(1,1),
    wo_id INT NOT NULL,
    activity VARCHAR(255),
    description TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    created_by VARCHAR(30),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- Incidents table
CREATE TABLE incidents (
    incident_id INT PRIMARY KEY IDENTITY(1,1),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    asset_id INT,
    it_item_id UNIQUEIDENTIFIER,
    reported_by VARCHAR(30),
    reported_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium'
);

-- Meter Readings table
CREATE TABLE meter_readings (
    reading_id INT PRIMARY KEY IDENTITY(1,1),
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    meter_name VARCHAR(100),
    reading_value DECIMAL(15,2),
    unit VARCHAR(20),
    reading_date DATETIME DEFAULT GETDATE(),
    recorded_by VARCHAR(30)
);

-- Plan Tasks table
CREATE TABLE plan_tasks (
    task_id INT PRIMARY KEY IDENTITY(1,1),
    plan_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    estimated_duration INT,
    FOREIGN KEY (plan_id) REFERENCES maintenance_plans(plan_id)
);

-- Maintenance Checklists table
CREATE TABLE maintenance_checklists (
    checklist_id INT PRIMARY KEY IDENTITY(1,1),
    wo_id INT NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    is_completed BIT DEFAULT 0,
    completed_at DATETIME,
    technician VARCHAR(50),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- Maintenance Checklist Templates table
CREATE TABLE maintenance_checklist_templates (
    template_id INT PRIMARY KEY IDENTITY(1,1),
    template_name VARCHAR(150) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    created_by VARCHAR(30)
);

-- ========================================
-- 3. INVENTORY/TOOLS TABLES
-- ========================================

-- Parts table
CREATE TABLE parts (
    part_id INT PRIMARY KEY IDENTITY(1,1),
    part_code VARCHAR(100),
    part_name VARCHAR(255) NOT NULL,
    part_category VARCHAR(128),
    unit VARCHAR(50),
    minimum_stock INT,
    status VARCHAR(50),
    purchase_period VARCHAR(20)
);

-- Part Categories table
CREATE TABLE part_categories (
    category_id INT PRIMARY KEY IDENTITY(1,1),
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_category_id INT
);

-- Spare Parts table
CREATE TABLE spare_parts (
    spare_part_id INT PRIMARY KEY IDENTITY(1,1),
    part_id INT NOT NULL,
    it_item_id UNIQUEIDENTIFIER,
    quantity_installed INT DEFAULT 1,
    installed_date DATETIME,
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Tools table
CREATE TABLE tools (
    tool_id INT PRIMARY KEY IDENTITY(1,1),
    tool_name VARCHAR(255) NOT NULL,
    tool_code VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'available',
    location VARCHAR(100)
);

-- Tool Assignments table
CREATE TABLE tool_assignments (
    assignment_id INT PRIMARY KEY IDENTITY(1,1),
    tool_id INT NOT NULL,
    nik VARCHAR(30) NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    returned_at DATETIME,
    assigned_by VARCHAR(30),
    FOREIGN KEY (tool_id) REFERENCES tools(tool_id)
);

-- Tool Transactions table
CREATE TABLE tool_transactions (
    transaction_id INT PRIMARY KEY IDENTITY(1,1),
    tool_id INT NOT NULL,
    transaction_type VARCHAR(20), -- 'checkout', 'checkin', 'maintenance'
    nik VARCHAR(30),
    transaction_date DATETIME DEFAULT GETDATE(),
    notes TEXT,
    FOREIGN KEY (tool_id) REFERENCES tools(tool_id)
);

-- Warehouses table
CREATE TABLE warehouses (
    warehouse_id INT PRIMARY KEY IDENTITY(1,1),
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    description TEXT
);

-- Warehouse Stocks table
CREATE TABLE warehouse_stocks (
    stock_id INT PRIMARY KEY IDENTITY(1,1),
    warehouse_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 0,
    last_updated DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    UNIQUE (warehouse_id, part_id)
);

-- Parts Usage table
CREATE TABLE parts_usages (
    usage_id INT PRIMARY KEY IDENTITY(1,1),
    part_id INT NOT NULL,
    wo_id INT,
    quantity_used INT NOT NULL,
    used_at DATETIME DEFAULT GETDATE(),
    used_by VARCHAR(30),
    notes TEXT,
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- ========================================
-- 4. ACCOUNTING TABLES
-- ========================================

-- Asset Depreciations table
CREATE TABLE asset_depreciations (
    depreciation_id INT PRIMARY KEY IDENTITY(1,1),
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    period VARCHAR(6) NOT NULL,
    depreciation_value DECIMAL(15,2),
    accumulated_value DECIMAL(15,2),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Indexes for user management
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nik ON users(nik);
CREATE INDEX idx_user_roles_nik ON user_roles(nik);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Indexes for maintenance
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_assigned_to ON work_orders(assigned_to_nik);
CREATE INDEX idx_work_orders_scheduled_date ON work_orders(scheduled_date);
CREATE INDEX idx_maintenance_plans_it_item ON maintenance_plans(it_item_id);

-- Indexes for inventory
CREATE INDEX idx_parts_name ON parts(part_name);
CREATE INDEX idx_parts_category ON parts(part_category);
CREATE INDEX idx_warehouse_stocks_warehouse ON warehouse_stocks(warehouse_id);
CREATE INDEX idx_warehouse_stocks_part ON warehouse_stocks(part_id);

-- Indexes for depreciation
CREATE INDEX idx_asset_depreciations_it_item ON asset_depreciations(it_item_id);
CREATE INDEX idx_asset_depreciations_period ON asset_depreciations(period);

-- ========================================
-- FOREIGN KEY CONSTRAINTS (Additional)
-- ========================================

-- Add foreign key constraints if tables exist
-- These are commented out as they reference tables that may not exist yet
-- ALTER TABLE work_orders ADD FOREIGN KEY (plan_id) REFERENCES maintenance_plans(plan_id);
-- ALTER TABLE work_orders ADD FOREIGN KEY (asset_id) REFERENCES assets(asset_id);
-- ALTER TABLE work_orders ADD FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

-- ========================================
-- SAMPLE DATA (Optional - Uncomment if needed)
-- ========================================

-- Insert default roles
-- INSERT INTO roles (role_name, description) VALUES 
-- ('admin', 'System Administrator'),
-- ('technician', 'Maintenance Technician'),
-- ('manager', 'Department Manager'),
-- ('user', 'Regular User');

-- Insert default warehouse
-- INSERT INTO warehouses (warehouse_name, location) VALUES 
-- ('Main Warehouse', 'Building A, Floor 1'),
-- ('IT Storage', 'Building B, Floor 2');

PRINT 'All missing tables created successfully!';
PRINT 'Total tables created: 31';
PRINT 'Please review foreign key constraints and adjust as needed.';
