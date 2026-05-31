-- Add device_condition column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS device_condition VARCHAR(20) DEFAULT 'new';

-- Update stock_quantity default to 1 instead of 0
-- This ensures products are "in stock" by default
ALTER TABLE products 
ALTER COLUMN stock_quantity SET DEFAULT 1;
