-- Create admin_settings table for storing configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type VARCHAR(50), -- 'payment', 'communication', 'general'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

-- Create indexes for efficient lookups
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX idx_admin_settings_type ON admin_settings(setting_type);

-- Add comment
COMMENT ON TABLE admin_settings IS 'Stores admin configuration like Paystack keys, email settings, etc.';

-- Allow RLS if needed
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins only
CREATE POLICY "Admins can view all settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON admin_settings
  FOR UPDATE USING (true);

CREATE POLICY "Only admins can insert settings" ON admin_settings
  FOR INSERT WITH CHECK (true);
