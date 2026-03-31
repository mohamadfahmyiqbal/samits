-- SQL Server DDL Script for SAMIT Application
-- Derived directly from the Sequelize models under be/models.
-- Tables that reference `it_items` receive their foreign keys after the ITAM section so dependencies resolve cleanly.

-- =============================================
-- Module 1 — User Management
-- =============================================

CREATE TABLE departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    code NVARCHAR(10) NULL UNIQUE,
    description NVARCHAR(255) NULL
);

CREATE TABLE roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(255) NULL
);

CREATE TABLE users (
    nik NVARCHAR(30) PRIMARY KEY,
    nama NVARCHAR(100) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NULL UNIQUE,
    phone NVARCHAR(30) NULL,
    position NVARCHAR(100) NULL,
    status NVARCHAR(20) NULL,
    last_login DATETIME2 NULL
);

CREATE TABLE user_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nik NVARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    CONSTRAINT FK_user_roles_users FOREIGN KEY (nik) REFERENCES users(nik),
    CONSTRAINT FK_user_roles_roles FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

CREATE UNIQUE INDEX UX_user_roles_nik_role ON user_roles (nik, role_id);

CREATE TABLE webPushSubscriptions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    endpointHash NVARCHAR(64) NOT NULL UNIQUE,
    endpoint NVARCHAR(MAX) NOT NULL,
    p256dh NVARCHAR(MAX) NULL,
    auth NVARCHAR(MAX) NULL,
    contentEncoding NVARCHAR(50) NULL,
    userNik NVARCHAR(20) NULL,
    userId NVARCHAR(100) NULL,
    userPosition NVARCHAR(100) NULL,
    rawSubscription NVARCHAR(MAX) NOT NULL,
    CONSTRAINT FK_webPushSubscriptions_users FOREIGN KEY (userNik) REFERENCES users(nik)
);

-- =============================================
-- Module 2 — EAM Core
-- =============================================

CREATE TABLE asset_main_types (
    asset_main_type_id INT IDENTITY(1,1) PRIMARY KEY,
    main_type_name NVARCHAR(50) NOT NULL
);

CREATE TABLE categories (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL
);

CREATE TABLE locations (
    location_id INT IDENTITY(1,1) PRIMARY KEY,
    location_name NVARCHAR(100) NULL
);

CREATE TABLE vendors (
    vendor_id INT IDENTITY(1,1) PRIMARY KEY,
    vendor_name NVARCHAR(100) NOT NULL,
    contact NVARCHAR(100) NULL
);

CREATE TABLE assets (
    asset_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_name NVARCHAR(150) NOT NULL,
    category_id INT NULL,
    vendor_id INT NULL,
    location_id INT NULL,
    serial_number NVARCHAR(100) NULL,
    purchase_date DATE NULL,
    depreciation_date DATE NULL,
    CONSTRAINT FK_assets_categories FOREIGN KEY (category_id) REFERENCES categories(category_id),
    CONSTRAINT FK_assets_vendors FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id),
    CONSTRAINT FK_assets_locations FOREIGN KEY (location_id) REFERENCES locations(location_id)
);

CREATE TABLE asset_status (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    status_name NVARCHAR(50) NOT NULL,
    status_description NVARCHAR(255) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    is_disposed BIT NOT NULL DEFAULT 0,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE asset_lifecycles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_asset_lifecycles_assets FOREIGN KEY (asset_id) REFERENCES assets(asset_id)
);

CREATE TABLE asset_audit_logs (
    audit_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NULL,
    asset_no NVARCHAR(50) NULL,
    event_type NVARCHAR(20) NOT NULL,
    actor_nik NVARCHAR(30) NULL,
    actor_name NVARCHAR(100) NULL,
    source_module NVARCHAR(50) NULL,
    request_id NVARCHAR(100) NULL,
    before_data NVARCHAR(MAX) NULL,
    after_data NVARCHAR(MAX) NULL,
    event_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    client_ip NVARCHAR(50) NULL,
    user_agent NVARCHAR(300) NULL
);

CREATE TABLE asset_documents (
    document_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    document_type NVARCHAR(50) NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    file_size BIGINT NULL,
    mime_type NVARCHAR(100) NULL,
    uploaded_by NVARCHAR(30) NULL,
    uploaded_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    notes NVARCHAR(500) NULL
);

CREATE TABLE asset_status_history (
    history_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    old_status NVARCHAR(50) NULL,
    new_status NVARCHAR(50) NOT NULL,
    changed_by_nik NVARCHAR(30) NULL,
    changed_by_name NVARCHAR(100) NULL,
    changed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    reason NVARCHAR(500) NULL,
    notes NVARCHAR(MAX) NULL
);

-- =============================================
-- Module 3 — Maintenance Flow
-- =============================================

CREATE TABLE maintenance_plans (
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NULL,
    plan_name NVARCHAR(150) NULL,
    scheduled_date DATE NULL,
    scheduled_end_date DATE NULL,
    pic NVARCHAR(100) NULL,
    status NVARCHAR(20) NULL DEFAULT 'pending',
    description NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    category NVARCHAR(50) NULL,
    maintenance_type NVARCHAR(100) NULL,
    hostname NVARCHAR(100) NULL,
    scheduled_start_time TIME NULL,
    scheduled_end_time TIME NULL,
    created_by NVARCHAR(100) NULL,
    priority NVARCHAR(10) NULL DEFAULT 'medium',
    criticality NVARCHAR(10) NULL DEFAULT 'medium',
    location NVARCHAR(200) NULL,
    required_skills NVARCHAR(MAX) NULL,
    estimated_duration DECIMAL(4,2) NULL DEFAULT 2.00,
    CONSTRAINT CK_maintenance_plans_priority CHECK (priority IN ('low','medium','high','critical') OR priority IS NULL),
    CONSTRAINT CK_maintenance_plans_criticality CHECK (criticality IN ('low','medium','high') OR criticality IS NULL)
);

CREATE TABLE plan_tasks (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_id INT NOT NULL,
    task_description NVARCHAR(255) NULL,
    CONSTRAINT FK_plan_tasks_maintenance_plans FOREIGN KEY (plan_id) REFERENCES maintenance_plans(plan_id)
);

CREATE TABLE work_orders (
    wo_id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    plan_id INT NOT NULL,
    description NVARCHAR(MAX) NULL,
    asset_id BIGINT NULL,
    it_item_id UNIQUEIDENTIFIER NULL,
    status NVARCHAR(50) NULL DEFAULT 'open',
    priority NVARCHAR(20) NULL DEFAULT 'medium',
    assigned_to_nik NVARCHAR(20) NULL,
    category NVARCHAR(50) NULL,
    scheduled_date DATETIME2 NULL,
    completed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_work_orders_plans FOREIGN KEY (plan_id) REFERENCES maintenance_plans(plan_id)
);

CREATE TABLE wo_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    nik NVARCHAR(30) NOT NULL,
    assigned_date DATETIME2 NULL,
    CONSTRAINT FK_wo_assignments_work_orders FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

CREATE TABLE wo_task_results (
    id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_wo_task_results_plan_tasks FOREIGN KEY (task_id) REFERENCES plan_tasks(task_id)
);

CREATE TABLE wo_signatures (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workorder_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_wo_signatures_work_orders FOREIGN KEY (workorder_id) REFERENCES work_orders(wo_id)
);

CREATE TABLE wo_timelines (
    id INT IDENTITY(1,1) PRIMARY KEY,
    workorder_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_wo_timelines_work_orders FOREIGN KEY (workorder_id) REFERENCES work_orders(wo_id)
);

CREATE TABLE breakdowns (
    breakdown_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    description NVARCHAR(MAX) NULL,
    detected_at DATETIME2 NULL,
    wo_id INT NULL,
    CONSTRAINT FK_breakdowns_assets FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    CONSTRAINT FK_breakdowns_work_orders FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

CREATE TABLE incidents (
    incident_id INT IDENTITY(1,1) PRIMARY KEY,
    request_id INT NOT NULL,
    asset_id UNIQUEIDENTIFIER NULL,
    category NVARCHAR(50) NULL,
    severity NVARCHAR(20) NULL,
    status NVARCHAR(20) NULL,
    detected_at DATETIME2 NULL,
    resolved_at DATETIME2 NULL
);

CREATE TABLE meter_readings (
    reading_id INT IDENTITY(1,1) PRIMARY KEY,
    asset_id INT NOT NULL,
    wo_id INT NULL,
    meter_value FLOAT NULL,
    reading_time DATETIME2 NULL,
    CONSTRAINT FK_meter_readings_assets FOREIGN KEY (asset_id) REFERENCES assets(asset_id),
    CONSTRAINT FK_meter_readings_work_orders FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id)
);

-- =============================================
-- Module 4 — Inventory Tools
-- =============================================

CREATE TABLE warehouses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE warehouse_stocks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    warehouse_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_warehouse_stocks_warehouses FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

CREATE TABLE spare_parts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE adjustment_reasons (
    reason_id INT IDENTITY(1,1) PRIMARY KEY,
    reason_description NVARCHAR(255) NULL
);

CREATE TABLE inventory_transactions (
    trans_id INT IDENTITY(1,1) PRIMARY KEY,
    part_id INT NOT NULL,
    wo_id INT NULL,
    reason_id INT NULL,
    qty INT NULL,
    trans_date DATETIME2 NULL,
    CONSTRAINT FK_inventory_transactions_parts FOREIGN KEY (part_id) REFERENCES spare_parts(id),
    CONSTRAINT FK_inventory_transactions_wo FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    CONSTRAINT FK_inventory_transactions_reasons FOREIGN KEY (reason_id) REFERENCES adjustment_reasons(reason_id)
);

CREATE TABLE parts_usage (
    id INT IDENTITY(1,1) PRIMARY KEY,
    wo_id INT NOT NULL,
    part_id INT NOT NULL,
    qty INT NULL,
    CONSTRAINT FK_parts_usage_work_orders FOREIGN KEY (wo_id) REFERENCES work_orders(wo_id),
    CONSTRAINT FK_parts_usage_spare_parts FOREIGN KEY (part_id) REFERENCES spare_parts(id)
);

CREATE TABLE tools (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE tool_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tool_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_tool_assignments_tools FOREIGN KEY (tool_id) REFERENCES tools(id)
);

CREATE TABLE tool_transactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tool_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_tool_transactions_tools FOREIGN KEY (tool_id) REFERENCES tools(id)
);

-- =============================================
-- Module 5 — ITAM Management
-- =============================================

CREATE TABLE it_categories (
    it_category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name NVARCHAR(100) NOT NULL,
    asset_group NVARCHAR(50) NULL,
    asset_type NVARCHAR(100) NULL,
    parent_category_id INT NULL,
    asset_main_type_id INT NULL,
    CONSTRAINT FK_it_categories_asset_main_types FOREIGN KEY (asset_main_type_id) REFERENCES asset_main_types(asset_main_type_id)
);

CREATE TABLE it_sub_categories (
    sub_category_id INT IDENTITY(1,1) PRIMARY KEY,
    it_category_id INT NOT NULL,
    sub_category_name NVARCHAR(100) NULL,
    CONSTRAINT FK_it_sub_categories_it_categories FOREIGN KEY (it_category_id) REFERENCES it_categories(it_category_id)
);

CREATE TABLE it_asset_groups (
    asset_group_id INT IDENTITY(1,1) PRIMARY KEY,
    sub_category_id INT NOT NULL,
    asset_group_name NVARCHAR(100) NULL,
    CONSTRAINT FK_it_asset_groups_it_sub_categories FOREIGN KEY (sub_category_id) REFERENCES it_sub_categories(sub_category_id)
);

CREATE TABLE it_classifications (
    classification_id INT IDENTITY(1,1) PRIMARY KEY,
    classification_name NVARCHAR(100) NOT NULL
);

CREATE TABLE it_items (
    it_item_id UNIQUEIDENTIFIER PRIMARY KEY,
    sub_category_id INT NOT NULL,
    category_id INT NULL,
    request_id INT NULL,
    current_status NVARCHAR(50) NULL,
    purchase_price_plan DECIMAL(18,4) NULL,
    purchase_price_actual DECIMAL(18,4) NULL,
    po_date_period NVARCHAR(6) NULL,
    inspection_date_period NVARCHAR(6) NULL,
    no_cip NVARCHAR(50) NULL,
    invoice_number NVARCHAR(100) NULL,
    line_code NVARCHAR(10) NULL,
    at_cost_value DECIMAL(18,4) NULL,
    useful_life_year INT NULL,
    initial_depreciation DECIMAL(18,4) NULL,
    accounting_asset_no NVARCHAR(50) NULL,
    acquisition_status NVARCHAR(20) NULL,
    is_disposed BIT NULL,
    disposal_id_ref INT NULL,
    asset_tag NVARCHAR(50) NULL,
    po_number NVARCHAR(100) NULL,
    classification_id INT NOT NULL DEFAULT 1,
    depreciation_end_date DATE NULL,
    disposal_plan_date DATE NULL,
    extend_warranty_date DATE NULL,
    asset_group_id INT NULL,
    asset_main_type_id INT NULL,
    CONSTRAINT FK_it_items_it_sub_categories FOREIGN KEY (sub_category_id) REFERENCES it_sub_categories(sub_category_id),
    CONSTRAINT FK_it_items_it_categories FOREIGN KEY (category_id) REFERENCES it_categories(it_category_id),
    CONSTRAINT FK_it_items_it_classifications FOREIGN KEY (classification_id) REFERENCES it_classifications(classification_id),
    CONSTRAINT FK_it_items_it_asset_groups FOREIGN KEY (asset_group_id) REFERENCES it_asset_groups(asset_group_id),
    CONSTRAINT FK_it_items_asset_main_types FOREIGN KEY (asset_main_type_id) REFERENCES asset_main_types(asset_main_type_id)
);

CREATE TABLE it_item_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nik NVARCHAR(30) NULL,
    assigned_at DATETIME2 NULL,
    returned_at DATETIME2 NULL,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT FK_it_item_assignments_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id),
    CONSTRAINT FK_it_item_assignments_users FOREIGN KEY (nik) REFERENCES users(nik)
);

CREATE TABLE it_item_attributes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    attr_name NVARCHAR(100) NULL,
    attr_value NVARCHAR(255) NULL,
    CONSTRAINT FK_it_item_attributes_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

CREATE TABLE it_item_networks (
    network_id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    hostname NVARCHAR(100) NULL,
    ip_address NVARCHAR(50) NULL,
    mac_address NVARCHAR(17) NULL,
    is_primary BIT NOT NULL,
    updated_at DATETIME2 NOT NULL,
    CONSTRAINT FK_it_item_networks_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

CREATE TABLE it_item_softwares (
    id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    software_name NVARCHAR(100) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    installed_at DATETIME2 NULL,
    version NVARCHAR(50) NULL,
    CONSTRAINT FK_it_item_softwares_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

CREATE TABLE it_item_setup_checklist (
    setup_id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    task_name NVARCHAR(100) NOT NULL,
    is_completed BIT NULL,
    completed_at DATETIME2 NULL,
    technician NVARCHAR(50) NULL,
    CONSTRAINT FK_it_item_setup_checklist_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

CREATE TABLE it_item_status_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(50) NULL,
    changed_at DATETIME2 NULL,
    CONSTRAINT FK_it_item_status_history_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

CREATE TABLE software_licenses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE license_allocations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    license_id INT NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_license_allocations_licenses FOREIGN KEY (license_id) REFERENCES software_licenses(id)
);

CREATE TABLE security_events (
    id INT IDENTITY(1,1) PRIMARY KEY,
    description NVARCHAR(MAX) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- Module 6 — General Utility
-- =============================================

CREATE TABLE attachments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    filename NVARCHAR(255) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE TABLE audit_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    action NVARCHAR(100) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- =============================================
-- Module 7 — Approval
-- =============================================

CREATE TABLE approval_levels (
    level_id INT IDENTITY(1,1) PRIMARY KEY,
    level_name NVARCHAR(100) NOT NULL
);

CREATE TABLE approval_history (
    approval_id INT IDENTITY(1,1) PRIMARY KEY,
    document_type NVARCHAR(50) NULL,
    document_id NVARCHAR(50) NULL,
    level_id INT NULL,
    approver_nik NVARCHAR(30) NULL,
    status NVARCHAR(20) NULL,
    notes NVARCHAR(MAX) NULL,
    created_at DATETIME2 NULL,
    updated_at DATETIME2 NULL,
    step_sequence INT NULL,
    CONSTRAINT FK_approval_history_levels FOREIGN KEY (level_id) REFERENCES approval_levels(level_id)
);

-- =============================================
-- Module 8 — HRGA (users table reused via HRGAUser model)
-- =============================================
-- (No additional tables created; HRGAUser maps to the existing users table.)

-- =============================================
-- Module 9 — Procurement
-- =============================================

CREATE TABLE deliveries (
    delivery_id INT IDENTITY(1,1) PRIMARY KEY,
    po_id INT NOT NULL,
    delivery_number NVARCHAR(50) NULL,
    delivery_date DATE NULL,
    received_by NVARCHAR(30) NULL,
    status NVARCHAR(20) NULL
);

CREATE TABLE delivery_items (
    delivery_item_id INT IDENTITY(1,1) PRIMARY KEY,
    delivery_id INT NOT NULL,
    item_name NVARCHAR(255) NULL,
    qty INT NULL,
    CONSTRAINT FK_delivery_items_deliveries FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id)
);

CREATE TABLE issue_order_details (
    order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
    request_id INT NULL,
    item_name NVARCHAR(255) NULL,
    account_code NVARCHAR(50) NULL,
    budget_timing NVARCHAR(20) NULL,
    budget_amount DECIMAL(15,2) NULL,
    purchase_timing NVARCHAR(20) NULL,
    purchase_amount DECIMAL(15,2) NULL,
    is_sold_to_customer NVARCHAR(5) NULL,
    customer_name NVARCHAR(150) NULL,
    sold_amount DECIMAL(15,2) NULL,
    profit_ratio DECIMAL(5,2) NULL
);

-- =============================================
-- Module 10 — Lifecycle
-- =============================================

CREATE TABLE asset_disposals (
    disposal_id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NULL,
    ba_number NVARCHAR(50) NULL,
    disposal_date DATE NULL,
    reason_disposal NVARCHAR(MAX) NULL,
    proposed_method NVARCHAR(20) NULL,
    net_book_value DECIMAL(15,2) NULL,
    nbv_date DATE NULL,
    acc_depreciation DECIMAL(15,2) NULL,
    evidence_photo_path NVARCHAR(255) NULL,
    status_disposal NVARCHAR(20) NULL
);

-- =============================================
-- Module 11 — Accounting
-- =============================================

CREATE TABLE asset_depreciations (
    depreciation_id INT IDENTITY(1,1) PRIMARY KEY,
    it_item_id UNIQUEIDENTIFIER NOT NULL,
    period NVARCHAR(6) NOT NULL,
    depreciation_value DECIMAL(15,2) NULL,
    accumulated_value DECIMAL(15,2) NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_asset_depreciations_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id)
);

-- =============================================
-- Deferred foreign keys referencing ITAM (it_items)
-- =============================================

ALTER TABLE asset_audit_logs
    ADD CONSTRAINT FK_asset_audit_logs_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

ALTER TABLE asset_documents
    ADD CONSTRAINT FK_asset_documents_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

ALTER TABLE asset_status_history
    ADD CONSTRAINT FK_asset_status_history_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

ALTER TABLE maintenance_plans
    ADD CONSTRAINT FK_maintenance_plans_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

ALTER TABLE work_orders
    ADD CONSTRAINT FK_work_orders_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

ALTER TABLE incidents
    ADD CONSTRAINT FK_incidents_items FOREIGN KEY (asset_id) REFERENCES it_items(it_item_id);

ALTER TABLE asset_disposals
    ADD CONSTRAINT FK_asset_disposals_items FOREIGN KEY (it_item_id) REFERENCES it_items(it_item_id);

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IDX_users_email ON users(email);
CREATE INDEX IDX_work_orders_status ON work_orders(status);
CREATE INDEX IDX_work_orders_assigned ON work_orders(assigned_to_nik);
CREATE INDEX IDX_it_items_asset_tag ON it_items(asset_tag);
CREATE INDEX IDX_it_item_assignments_nik ON it_item_assignments(nik);
CREATE INDEX IDX_it_item_networks_it_item ON it_item_networks(it_item_id);

PRINT 'SQL Server DDL for SAMIT generated from Sequelize models.';
