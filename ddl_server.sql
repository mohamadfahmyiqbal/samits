-- SQL Server DDL Script for SAMIT Application
-- Generated from Sequelize models

-- =============================================
-- 1. USER MANAGEMENT MODULE
-- =============================================

-- Departments Table
CREATE TABLE departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE NULL,
    description VARCHAR(255) NULL
);

-- Roles Table
CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL
);

-- Users Table
CREATE TABLE users (
    nik VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    phone VARCHAR(15) NULL,
    position VARCHAR(50) NULL,
    status DATE NULL,
    last_login DATETIME NULL
);

-- User Roles Table
CREATE TABLE user_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nik VARCHAR(20) NOT NULL,
    role_id INT NOT NULL
);

-- Web Push Subscriptions Table
CREATE TABLE web_push_subscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nik VARCHAR(20) NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    p256dh_key VARCHAR(255) NOT NULL,
    auth_key VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- =============================================
-- 2. EAM CORE MODULE
-- =============================================

-- Asset Main Types Table
CREATE TABLE asset_main_types (
    main_type_id INT IDENTITY(1,1) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- Categories Table
CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

-- Asset Status Table
CREATE TABLE asset_status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL
);

-- Locations Table
CREATE TABLE locations (
    location_id INT IDENTITY(1,1) PRIMARY KEY,
    location_name VARCHAR(100) NULL
);

-- Vendors Table
CREATE TABLE vendors (
    vendor_id INT IDENTITY(1,1) PRIMARY KEY,
    vendor_name VARCHAR(100) NOT NULL,
    contact VARCHAR(100) NULL
);

-- Assets Table
CREATE TABLE assets (
    asset_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_name VARCHAR(150) NOT NULL,
    category_id INT NULL,
    vendor_id INT NULL,
    location_id INT NULL,
    serial_number VARCHAR(100) NULL,
    purchase_date DATE NULL,
    depreciation_date DATE NULL
);

-- Asset Documents Table
CREATE TABLE asset_documents (
    doc_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    doc_name VARCHAR(255) NOT NULL,
    doc_path VARCHAR(500) NOT NULL,
    doc_type VARCHAR(50) NULL,
    upload_date DATETIME DEFAULT GETDATE()
);

-- Asset Audit Logs Table
CREATE TABLE asset_audit_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_value VARCHAR(MAX) NULL,
    new_value VARCHAR(MAX) NULL,
    changed_by VARCHAR(20) NULL,
    changed_at DATETIME DEFAULT GETDATE()
);

-- Asset Lifecycle Table
CREATE TABLE asset_lifecycle (
    lifecycle_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    stage VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    notes VARCHAR(MAX) NULL
);

-- Asset Status History Table
CREATE TABLE asset_status_history (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    old_status_id INT NULL,
    new_status_id INT NOT NULL,
    changed_by VARCHAR(20) NULL,
    changed_at DATETIME DEFAULT GETDATE(),
    notes VARCHAR(255) NULL
);

-- =============================================
-- 3. MAINTENANCE FLOW MODULE
-- =============================================

-- Maintenance Plans Table
CREATE TABLE maintenance_plans (
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    asset_id INT NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NULL,
    next_due_date DATE NULL,
    is_active BIT DEFAULT 1
);

-- Plan Tasks Table
CREATE TABLE plan_tasks (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description VARCHAR(MAX) NULL,
    estimated_hours DECIMAL(5,2) NULL
);

-- Work Orders Table
CREATE TABLE work_orders (
    wo_id INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(MAX) NULL,
    asset_id BIGINT NOT NULL,
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to_nik VARCHAR(20) NULL,
    category VARCHAR(50) NULL,
    scheduled_date DATETIME NULL,
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- WO Assignments Table
CREATE TABLE wo_assignments (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    nik VARCHAR(20) NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    assigned_by VARCHAR(20) NULL
);

-- WO Task Results Table
CREATE TABLE wo_task_results (
    result_id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    result VARCHAR(MAX) NULL,
    completed_at DATETIME NULL,
    completed_by VARCHAR(20) NULL
);

-- WO Timeline Table
CREATE TABLE wo_timeline (
    timeline_id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    description VARCHAR(MAX) NULL,
    created_by VARCHAR(20) NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- WO Signatures Table
CREATE TABLE wo_signatures (
    signature_id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    nik VARCHAR(20) NOT NULL,
    signature_path VARCHAR(500) NULL,
    signed_at DATETIME DEFAULT GETDATE(),
    role VARCHAR(50) NULL
);

-- Breakdowns Table
CREATE TABLE breakdowns (
    breakdown_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    breakdown_date DATETIME NOT NULL,
    description VARCHAR(MAX) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    reported_by VARCHAR(20) NULL,
    resolved_at DATETIME NULL,
    resolved_by VARCHAR(20) NULL
);

-- Meter Readings Table
CREATE TABLE meter_readings (
    reading_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    meter_type VARCHAR(50) NOT NULL,
    reading_value DECIMAL(15,4) NOT NULL,
    reading_date DATETIME NOT NULL,
    recorded_by VARCHAR(20) NULL
);

-- =============================================
-- 4. INVENTORY TOOLS MODULE
-- =============================================

-- Warehouses Table
CREATE TABLE warehouses (
    warehouse_id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NULL,
    manager VARCHAR(100) NULL
);

-- Spare Parts Table
CREATE TABLE spare_parts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    part_number VARCHAR(50) NULL,
    description VARCHAR(MAX) NULL,
    unit VARCHAR(20) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Warehouse Stock Table
CREATE TABLE warehouse_stock (
    stock_id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT NOT NULL,
    spare_part_id INT NOT NULL,
    quantity DECIMAL(15,2) NOT NULL DEFAULT 0,
    min_stock_level DECIMAL(15,2) NULL,
    max_stock_level DECIMAL(15,2) NULL,
    last_updated DATETIME DEFAULT GETDATE()
);

-- Tools Table
CREATE TABLE tools (
    tool_id INT IDENTITY(1,1) PRIMARY KEY,
    tool_name VARCHAR(100) NOT NULL,
    tool_code VARCHAR(50) UNIQUE NULL,
    description VARCHAR(MAX) NULL,
    status VARCHAR(20) DEFAULT 'available'
);

-- Tool Assignment Table
CREATE TABLE tool_assignment (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    tool_id INT NOT NULL,
    nik VARCHAR(20) NOT NULL,
    wo_id INT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    returned_at DATETIME NULL,
    notes VARCHAR(255) NULL
);

-- Tool Transaction Table
CREATE TABLE tool_transaction (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    tool_id INT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    nik VARCHAR(20) NULL,
    transaction_date DATETIME DEFAULT GETDATE(),
    notes VARCHAR(255) NULL
);

-- Parts Usage Table
CREATE TABLE parts_usage (
    usage_id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    spare_part_id INT NOT NULL,
    quantity_used DECIMAL(15,2) NOT NULL,
    used_at DATETIME DEFAULT GETDATE(),
    used_by VARCHAR(20) NULL
);

-- Inventory Transaction Table
CREATE TABLE inventory_transaction (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT NOT NULL,
    spare_part_id INT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    reference_id INT NULL,
    reference_type VARCHAR(50) NULL,
    transaction_date DATETIME DEFAULT GETDATE(),
    created_by VARCHAR(20) NULL
);

-- Adjustment Reason Table
CREATE TABLE adjustment_reason (
    reason_id INT IDENTITY(1,1) PRIMARY KEY,
    reason_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- =============================================
-- 5. ITAM MANAGEMENT MODULE
-- =============================================

-- IT Categories Table
CREATE TABLE it_categories (
    it_category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- IT Sub Categories Table
CREATE TABLE it_sub_categories (
    sub_category_id INT IDENTITY(1,1) PRIMARY KEY,
    it_category_id INT NOT NULL,
    sub_category_name VARCHAR(100) NOT NULL
);

-- IT Classifications Table
CREATE TABLE it_classifications (
    classification_id INT IDENTITY(1,1) PRIMARY KEY,
    classification_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- IT Asset Groups Table
CREATE TABLE it_asset_groups (
    group_id INT IDENTITY(1,1) PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL
);

-- IT Items Table
CREATE TABLE it_items (
    item_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_tag VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    it_category_id INT NULL,
    sub_category_id INT NULL,
    classification_id INT NULL,
    group_id INT NULL,
    serial_number VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    manufacturer VARCHAR(100) NULL,
    status VARCHAR(50) DEFAULT 'active',
    purchase_date DATE NULL,
    warranty_expiry DATE NULL,
    location VARCHAR(255) NULL,
    assigned_to VARCHAR(20) NULL,
    notes VARCHAR(MAX) NULL
);

-- IT Item Attributes Table
CREATE TABLE it_item_attributes (
    attribute_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(MAX) NULL
);

-- IT Item Assignment Table
CREATE TABLE it_item_assignment (
    assignment_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    nik VARCHAR(20) NOT NULL,
    assigned_at DATETIME DEFAULT GETDATE(),
    assigned_by VARCHAR(20) NULL,
    returned_at DATETIME NULL,
    notes VARCHAR(255) NULL
);

-- IT Item Network Table
CREATE TABLE it_item_network (
    network_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    ip_address VARCHAR(15) NULL,
    mac_address VARCHAR(17) NULL,
    subnet_mask VARCHAR(15) NULL,
    gateway VARCHAR(15) NULL,
    dns VARCHAR(255) NULL
);

-- IT Item Software Table
CREATE TABLE it_item_software (
    software_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    software_name VARCHAR(200) NOT NULL,
    version VARCHAR(50) NULL,
    license_key VARCHAR(255) NULL,
    install_date DATE NULL,
    status VARCHAR(20) DEFAULT 'installed'
);

-- IT Item Setup Checklist Table
CREATE TABLE it_item_setup_checklist (
    checklist_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    is_completed BIT DEFAULT 0,
    completed_at DATETIME NULL,
    completed_by VARCHAR(20) NULL
);

-- IT Item Status History Table
CREATE TABLE it_item_status_history (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NOT NULL,
    old_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(20) NULL,
    changed_at DATETIME DEFAULT GETDATE(),
    notes VARCHAR(255) NULL
);

-- Software Licenses Table
CREATE TABLE software_licenses (
    license_id INT IDENTITY(1,1) PRIMARY KEY,
    software_name VARCHAR(200) NOT NULL,
    license_key VARCHAR(255) UNIQUE NULL,
    total_licenses INT NOT NULL DEFAULT 0,
    used_licenses INT NOT NULL DEFAULT 0,
    purchase_date DATE NULL,
    expiry_date DATE NULL,
    vendor VARCHAR(100) NULL
);

-- License Allocation Table
CREATE TABLE license_allocation (
    allocation_id INT IDENTITY(1,1) PRIMARY KEY,
    license_id INT NOT NULL,
    nik VARCHAR(20) NOT NULL,
    allocated_at DATETIME DEFAULT GETDATE(),
    allocated_by VARCHAR(20) NULL,
    revoked_at DATETIME NULL,
    notes VARCHAR(255) NULL
);

-- Security Events Table
CREATE TABLE security_events (
    event_id INT IDENTITY(1,1) PRIMARY KEY,
    item_id INT NULL,
    event_type VARCHAR(100) NOT NULL,
    description VARCHAR(MAX) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    detected_at DATETIME DEFAULT GETDATE(),
    resolved_at DATETIME NULL,
    resolved_by VARCHAR(20) NULL
);

-- =============================================
-- 6. GENERAL UTILITY MODULE
-- =============================================

-- Attachments Table
CREATE TABLE attachments (
    attachment_id INT IDENTITY(1,1) PRIMARY KEY,
    reference_id INT NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NULL,
    mime_type VARCHAR(100) NULL,
    uploaded_by VARCHAR(20) NULL,
    uploaded_at DATETIME DEFAULT GETDATE()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    log_id INT IDENTITY(1,1) PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values VARCHAR(MAX) NULL,
    new_values VARCHAR(MAX) NULL,
    changed_by VARCHAR(20) NULL,
    changed_at DATETIME DEFAULT GETDATE(),
    ip_address VARCHAR(45) NULL
);

-- =============================================
-- 7. APPROVAL MODULE
-- =============================================

-- Approval History Table
CREATE TABLE approval_history (
    approval_id INT IDENTITY(1,1) PRIMARY KEY,
    reference_id INT NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    nik VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL,
    comments VARCHAR(MAX) NULL,
    approved_at DATETIME DEFAULT GETDATE()
);

-- =============================================
-- 8. HRGA MODULE
-- =============================================

-- (Add HRGA specific tables here based on available models)

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nik ON users(nik);

-- Assets indexes
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_vendor ON assets(vendor_id);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assets_serial ON assets(serial_number);

-- Work Orders indexes
CREATE INDEX idx_wo_asset ON work_orders(asset_id);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_assigned ON work_orders(assigned_to_nik);
CREATE INDEX idx_wo_date ON work_orders(scheduled_date);

-- IT Items indexes
CREATE INDEX idx_it_items_category ON it_items(it_category_id);
CREATE INDEX idx_it_items_asset_tag ON it_items(asset_tag);
CREATE INDEX idx_it_items_assigned ON it_items(assigned_to);

-- Audit Logs indexes
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_date ON audit_logs(changed_at);

PRINT 'SQL Server DDL for SAMIT Application completed successfully!';
