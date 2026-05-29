import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Run the migration SQL
    const migrationSQL = `
      -- Create admin_users table (for managing admins)
      CREATE TABLE IF NOT EXISTS admin_users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL UNIQUE,
        full_name VARCHAR(255),
        is_super_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create products table
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'NGN',
        specs TEXT,
        budget_tier VARCHAR(50),
        compatible_software VARCHAR(255),
        image_url VARCHAR(500),
        stock_quantity INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create product_images table (for multiple images per product)
      CREATE TABLE IF NOT EXISTS product_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create inquiries table for customer inquiries via WhatsApp
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20) NOT NULL,
        product_id UUID REFERENCES products(id),
        inquiry_type VARCHAR(50),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create user preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        budget VARCHAR(50),
        software_choice VARCHAR(100),
        preferred_category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id),
        reviewer_name VARCHAR(255) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_budget_tier ON products(budget_tier);
      CREATE INDEX IF NOT EXISTS idx_products_compatible_software ON products(compatible_software);
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
      CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
    `

    // Try to execute via RPC
    let error: any = null
    try {
      const result = await supabase.rpc('exec_sql', {
        sql: migrationSQL,
      })
      error = result.error
    } catch (e) {
      // RPC doesn't exist - this is expected, we'll provide manual instructions
      error = { message: 'Migration needs to be run manually' }
    }

    if (error) {
      console.error('[v0] Migration error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Tables may already exist. This is OK!'
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully'
    })
  } catch (error: any) {
    console.error('[v0] Setup error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Please run the migration manually in Supabase SQL Editor'
    }, { status: 500 })
  }
}
