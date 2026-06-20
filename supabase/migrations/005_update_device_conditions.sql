-- Update device_condition column to include UK used and US used
ALTER TABLE products 
ALTER COLUMN device_condition SET DEFAULT 'new';

-- Add column to track image order and gallery
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS show_all_images BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_image_count INTEGER DEFAULT 1;

-- Create product_gallery table for better image management
CREATE TABLE IF NOT EXISTS product_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_gallery_product_id ON product_gallery(product_id);
CREATE INDEX idx_product_gallery_order ON product_gallery(product_id, display_order);

-- Add fields to products table for dynamic specs
ALTER TABLE products
ADD COLUMN IF NOT EXISTS requires_specs BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS processor_generation_custom VARCHAR(100),
ADD COLUMN IF NOT EXISTS ram_gb_custom INTEGER,
ADD COLUMN IF NOT EXISTS storage_gb_custom INTEGER,
ADD COLUMN IF NOT EXISTS screen_size_custom DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS graphics_custom VARCHAR(255),
ADD COLUMN IF NOT EXISTS brand_custom VARCHAR(100);

-- Add unread complaints flag
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Create order management table (if not exists)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id UUID REFERENCES products(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address VARCHAR(500),
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  order_notes TEXT,
  questionnaire_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
