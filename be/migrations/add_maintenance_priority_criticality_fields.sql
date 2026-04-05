-- Migration: Add priority, criticality, location, required_skills, estimated_duration fields to maintenance_plans
-- Date: 2025-03-29
-- Description: Add industry-standard maintenance scheduling fields

-- Add new columns to maintenance_plans table
ALTER TABLE maintenance_plans 
ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN criticality VARCHAR(20) DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high')),
ADD COLUMN location VARCHAR(200),
ADD COLUMN required_skills JSON,
ADD COLUMN estimated_duration DECIMAL(4,2) DEFAULT 2.0;

-- Create index for priority and criticality for better query performance
CREATE INDEX idx_maintenance_plans_priority ON maintenance_plans(priority);
CREATE INDEX idx_maintenance_plans_criticality ON maintenance_plans(criticality);

-- Update existing records with default values
UPDATE maintenance_plans 
SET 
    priority = 'medium',
    criticality = 'medium',
    estimated_duration = 2.0
WHERE priority IS NULL OR criticality IS NULL OR estimated_duration IS NULL;

-- Add comment for documentation
COMMENT ON TABLE maintenance_plans IS 'Enhanced maintenance planning table with priority and criticality fields';
COMMENT ON COLUMN maintenance_plans.priority IS 'Task priority level: low, medium, high, critical';
COMMENT ON COLUMN maintenance_plans.criticality IS 'Asset criticality level: low, medium, high';
COMMENT ON COLUMN maintenance_plans.location IS 'Physical location where maintenance will be performed';
COMMENT ON COLUMN maintenance_plans.required_skills IS 'JSON array of required skills for the maintenance task';
COMMENT ON COLUMN maintenance_plans.estimated_duration IS 'Estimated duration in hours (decimal)';
