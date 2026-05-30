# Image Upload - Complete Setup Guide
## Status: Ready for Production (After Database Setup)

---

## What's Already Done ✅

### 1. Image Storage - Vercel Blob
- ✅ Upload endpoint created at `/api/upload`
- ✅ Uses Vercel Blob (no Supabase bucket issues)
- ✅ Automatically generates public URLs
- ✅ Handles file validation and errors

### 2. Admin File Picker
- ✅ "+ Choose Images" button functional
- ✅ Opens native file picker on click
- ✅ Supports PNG, JPG, JPEG, GIF, WebP
- ✅ Drag & drop enabled with visual feedback

### 3. Image Preview Grid
- ✅ Displays uploaded image thumbnails
- ✅ Remove button on each image
- ✅ "Add More Images" button to upload additional files

---

## What You Need To Do

### CRITICAL: Create Database Tables

The error "Could not find the table 'public.products'" means the database tables haven't been created yet.

**Follow these steps:**

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button

3. **Run Migration SQL**
   - Copy this SQL and paste it:

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

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
```

4. **Click "Run"**
   - Wait for "Success" message
   - Tables are now created

---

## After Database Setup

1. **Refresh Admin Page**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Logout and login again

2. **Test Image Upload**
   - Go to `/admin/gadgets/new`
   - Click "+ Choose Images"
   - Select or drag an image file
   - Image uploads to Vercel Blob
   - Preview appears in grid

3. **Complete Product Form**
   - Fill product name, price, description
   - Select category and brand
   - Add as many images as needed
   - Click "Add Gadget" to save

---

## How Image Upload Works

```
User selects image
       ↓
File sent to /api/upload
       ↓
Vercel Blob receives file
       ↓
Public URL generated
       ↓
URL displayed in preview
       ↓
Product saved with image URLs
```

---

## Technical Summary

### Upload Endpoint
**File:** `/app/api/upload/route.ts`
- Accepts FormData with file
- Uses `@vercel/blob` for storage
- Returns public URL
- No bucket management needed

### Database
**Tables Created:**
- `products` - Product information
- `product_images` - Image storage
- `categories` - Product categories
- `admin_users` - Admin accounts
- `reviews` - Product reviews

### Storage
- **Provider:** Vercel Blob
- **Access:** Public (no authentication needed)
- **URLs:** Publicly accessible immediately
- **Pricing:** Included in Vercel free tier

---

## Troubleshooting

### "Table not found" after creating tables
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Logout and login again

### Image upload still fails
- Check Blob integration is connected
- Verify BLOB_READ_WRITE_TOKEN env var exists
- Check browser console for errors

### Images don't display
- Check the public URL is being returned
- Verify Blob storage is accessible
- Check product is saved with correct image URL

---

**Once database tables are created, everything will work perfectly!**

