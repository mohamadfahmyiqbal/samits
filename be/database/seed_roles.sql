-- Seed data for SAMIT roles
-- Run this SQL to populate the 4 required roles for role-based sidebar

-- Insert 4 main roles
INSERT INTO roles (role_name, description) VALUES 
('administrator', 'Full system access - can manage users, all approvals, finance, and system configuration'),
('user', 'Regular user - can request assets and view basic dashboards'),
('asset controller', 'Manages assets, stock control, and asset-related approvals'),
('maintenance', 'Handles maintenance work orders, preventive/corrective maintenance tasks');

-- Verify insert
SELECT * FROM roles;
