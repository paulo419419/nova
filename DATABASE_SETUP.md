# Database Setup Instructions

## Problem
The `products` table and other required tables don't exist in your Supabase database.

## Solution - Create Tables in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Open https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Copy and Paste Migration SQL**
   - Copy the entire content from: `/supabase/migrations/001_create_tables.sql`
   - Paste it into the SQL Editor

4. **Execute the Query**
   - Click "Run" button (or Cmd+Enter / Ctrl+Enter)
   - Wait for "Success" message

5. **Verify Tables Created**
   - Go to "Table Editor" in left sidebar
   - You should see:
     - products
     - product_images
     - admin_users
     - inquiries
     - categories
     - reviews
     - user_preferences

### Option 2: Quick Copy-Paste

Below is the complete SQL to create all required tables:

```sql
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
```

### What These Tables Do

| Table | Purpose |
|-------|---------|
| **products** | Stores product information (name, price, description, etc.) |
| **product_images** | Stores multiple images per product with Blob URLs |
| **admin_users** | Stores admin user information |
| **product_images** | Links images to products |

## After Creating Tables

1. Go back to your admin dashboard
2. Try uploading a product image again
3. Images will now upload to Vercel Blob successfully
4. Products will save with image URLs

## If You Still Get "Table Not Found"

1. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Logout and login again to admin dashboard
3. Try uploading a product again

---

**Once tables are created, your image upload will work perfectly with Vercel Blob!**

