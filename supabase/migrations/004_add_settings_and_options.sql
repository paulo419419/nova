-- Admin Settings Table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processors Table
CREATE TABLE IF NOT EXISTS processors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RAM Options Table
CREATE TABLE IF NOT EXISTS ram_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value INTEGER UNIQUE NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage Options Table
CREATE TABLE IF NOT EXISTS storage_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value INTEGER UNIQUE NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Screen Sizes Table
CREATE TABLE IF NOT EXISTS screen_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value DECIMAL(5,2) UNIQUE NOT NULL,
  label VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GPU Options Table
CREATE TABLE IF NOT EXISTS gpu_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Software Options Table
CREATE TABLE IF NOT EXISTS software_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default options
INSERT INTO brands (name) VALUES ('Apple'), ('Dell'), ('HP'), ('Lenovo'), ('ASUS'), ('Samsung'), ('LG'), ('Sony')
ON CONFLICT (name) DO NOTHING;

INSERT INTO processors (name) VALUES ('Intel Core i3'), ('Intel Core i5'), ('Intel Core i7'), ('Intel Core i9'), 
('AMD Ryzen 3'), ('AMD Ryzen 5'), ('AMD Ryzen 7'), ('Apple M1'), ('Apple M2'), ('Apple M3')
ON CONFLICT (name) DO NOTHING;

INSERT INTO ram_options (value, label) VALUES (4, '4GB'), (8, '8GB'), (16, '16GB'), (32, '32GB'), (64, '64GB')
ON CONFLICT (value) DO NOTHING;

INSERT INTO storage_options (value, label) VALUES (128, '128GB'), (256, '256GB'), (512, '512GB'), (1024, '1TB'), (2048, '2TB')
ON CONFLICT (value) DO NOTHING;

INSERT INTO screen_sizes (value, label) VALUES (13.3, '13.3"'), (14, '14"'), (15.6, '15.6"'), (17, '17"')
ON CONFLICT (value) DO NOTHING;

INSERT INTO gpu_options (name) VALUES ('Intel Iris Xe'), ('NVIDIA RTX 3050'), ('NVIDIA RTX 3060'), ('NVIDIA RTX 3080'), 
('AMD Radeon'), ('Apple GPU')
ON CONFLICT (name) DO NOTHING;

INSERT INTO software_options (name) VALUES ('CapCut'), ('Adobe Premiere'), ('DaVinci Resolve'), ('Final Cut Pro'), 
('Adobe Photoshop'), ('Lightroom'), ('Blender'), ('AutoCAD')
ON CONFLICT (name) DO NOTHING;

-- Add indexes
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_processors_name ON processors(name);
CREATE INDEX idx_software_name ON software_options(name);
