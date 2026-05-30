# Fix Missing 'brand' Column - Complete Instructions

## Problem
Error: `Could not find the 'brand' column of 'products' in the schema cache`

The products table is missing the following columns:
- brand
- processor
- processor_generation
- ram_gb
- storage_gb
- screen_size
- graphics
- price_category
- is_in_stock

## Solution - Add Columns to Database

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query** button

### Step 2: Run the Migration SQL
Copy and paste this SQL:

```sql
-- Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor_generation VARCHAR(50),
ADD COLUMN IF NOT EXISTS ram_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS storage_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS screen_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS graphics VARCHAR(100),
ADD COLUMN IF NOT EXISTS price_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_processor ON products(processor);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
```

### Step 3: Click Run
- Click the **Run** button
- Wait for "Success" message
- All columns will be added immediately

### Step 4: Refresh and Test
1. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Logout and login again to admin
3. Go to `/admin/gadgets/new`
4. Fill the form and upload images
5. Product should save successfully!

## What Each Column Does

| Column | Purpose |
|--------|---------|
| `brand` | Product brand (Apple, Dell, HP, etc.) |
| `processor` | CPU type (M3, Intel i7, AMD Ryzen, etc.) |
| `processor_generation` | Processor generation (3rd Gen, 5th Gen, etc.) |
| `ram_gb` | RAM amount in GB (8, 16, 32, etc.) |
| `storage_gb` | Storage amount in GB (256, 512, 1024, etc.) |
| `screen_size` | Screen size in inches (13.3, 14, 15.6, etc.) |
| `graphics` | Graphics card (Intel Iris, RTX 4060, etc.) |
| `price_category` | Price range (budget, mid-range, premium) |
| `is_in_stock` | Inventory status (true/false) |

## Testing the Upload After Adding Columns

1. **Login to Admin:**
   - Email: `juliusokpanachi419@gmail.com`
   - Password: `12345678`

2. **Go to Add New Gadget:**
   - Click "Add New Gadget" button
   - Or visit: `/admin/gadgets/new`

3. **Fill Product Form:**
   - Product Name: `Apple MacBook Pro M3 14-inch`
   - Price: `350000`
   - Description: `High-performance laptop with M3 Pro chip`
   - Category: `Laptop`
   - Brand: `Apple`
   - Processor: `M3`
   - Generation: `3rd Gen`
   - RAM: `18GB`
   - Storage: `512GB`
   - Screen: `14.0`
   - Graphics: `M3 Pro GPU`

4. **Upload Images:**
   - Click "+ Choose Images"
   - Select image file (PNG, JPG, etc.)
   - Image will upload to Vercel Blob
   - Preview appears in grid
   - Add more images if needed

5. **Submit:**
   - Click "Add Gadget" button
   - Product saves with all fields and images
   - Redirects to dashboard

## Expected Result After Fix

✅ All form fields will be saved to database
✅ Images will upload to Vercel Blob
✅ Product will display on product pages
✅ Images accessible via public URLs

## If Still Having Issues

1. **Check browser console (F12):**
   - Look for any error messages with [v0] prefix
   - Share these errors

2. **Verify columns exist:**
   - Go to Supabase → Table Editor
   - Click on "products" table
   - You should see all columns listed

3. **Hard refresh and re-login:**
   - Clear browser cache completely
   - Logout and login again
   - Try the form again

---

**Once columns are added, the upload system will work perfectly!**

