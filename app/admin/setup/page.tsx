'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const migrationSQL = `-- Create admin_users table
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

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_budget_tier ON products(budget_tier);
CREATE INDEX IF NOT EXISTS idx_products_compatible_software ON products(compatible_software);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_order ON product_images(product_id, display_order);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);`

  const handleCopy = () => {
    navigator.clipboard.writeText(migrationSQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Database Setup Required
              </h1>
              <p className="text-slate-600 mb-6">
                Initialize your Supabase database with the required tables
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Step 1: Go to Supabase Dashboard</h2>
                <p className="text-slate-600 mb-3">
                  Open your Supabase project dashboard and navigate to the SQL Editor.
                </p>
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Open Supabase Dashboard →
                </a>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Step 2: Copy & Run SQL</h2>
                <p className="text-slate-600 mb-4">
                  Copy the SQL code below and paste it into the Supabase SQL Editor, then click "Run".
                </p>

                {/* SQL Code Block */}
                <div className="bg-slate-900 rounded-lg p-4 mb-4 relative">
                  <pre className="text-slate-300 text-sm overflow-x-auto">
                    <code>{migrationSQL}</code>
                  </pre>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4"
                  >
                    {copied ? 'Copied!' : 'Copy SQL'}
                  </Button>
                </div>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Step 3: Return Here</h2>
                <p className="text-slate-600 mb-3">
                  After running the SQL successfully, return to this page and proceed.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-4 justify-center pt-6 border-t border-slate-200">
              <Link href="/admin/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Check Setup & Continue
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline">
                  Back to Login
                </Button>
              </Link>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> This setup only needs to be done once. After running the SQL, the tables will be created and you can start adding products.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
