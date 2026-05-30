# Add Missing Columns to Products Table

## Problem
The products table is missing columns required by the form:
- `brand`
- `processor`
- `processor_generation`
- `ram_gb`
- `storage_gb`
- `screen_size`
- `graphics`
- `price_category`
- `is_in_stock`

Error: `Could not find the 'brand' column of 'products'`

## Solution - Add Columns in Supabase

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query" button

3. **Copy and Paste This SQL**

```sql
-- Add missing columns to products table
ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor VARCHAR(100),
ADD COLUMN IF NOT EXISTS processor_generation VARCHAR(50),
ADD COLUMN IF NOT EXISTS ram_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS storage_gb VARCHAR(50),
ADD COLUMN IF NOT EXISTS screen_size VARCHAR(20),
ADD COLUMN IF NOT EXISTS graphics VARCHAR(100),
ADD COLUMN IF NOT EXISTS price_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_in_stock BOOLEAN DEFAULT true;
```

4. **Click "Run"**
   - Wait for "Success" message
   - Columns are now added to the table

5. **Verify in Table Editor**
   - Go to "Table Editor" in left sidebar
   - Select "products" table
   - You should see all the new columns

---

## After Adding Columns

1. **Hard refresh your browser**
   - Windows: Ctrl+Shift+R
   - Mac: Cmd+Shift+R

2. **Logout and login** to admin dashboard

3. **Test Image Upload**
   - Go to `/admin/gadgets/new`
   - Fill in product details including:
     - Product Name
     - Price
     - Description
     - Category
     - Brand (dropdown)
     - Processor (dropdown)
     - RAM, Storage, Screen Size, etc.
   - Click "+ Choose Images"
   - Select an image
   - Product should save successfully with image

---

## What Each Column Does

| Column | Type | Purpose |
|--------|------|---------|
| brand | VARCHAR(100) | Product brand (Apple, Dell, HP, etc.) |
| processor | VARCHAR(100) | CPU/Processor type (Core i7, M3, etc.) |
| processor_generation | VARCHAR(50) | Processor generation (11th Gen, etc.) |
| ram_gb | VARCHAR(50) | RAM memory size (8GB, 16GB, etc.) |
| storage_gb | VARCHAR(50) | Storage capacity (256GB, 512GB, etc.) |
| screen_size | VARCHAR(20) | Screen/Display size (14", 15.6", etc.) |
| graphics | VARCHAR(100) | Graphics card/GPU (RTX 3080, Iris, etc.) |
| price_category | VARCHAR(50) | Budget tier (100k, 200k, 300k, above) |
| is_in_stock | BOOLEAN | Whether product is in stock |

---

## Files Updated

- `/supabase/migrations/001_create_tables.sql` - Updated with new columns
- `/supabase/migrations/002_add_product_columns.sql` - Migration script
- `/scripts/add-columns.js` - Node.js migration executor

---

## Testing Image Upload After Migration

Once columns are added:

1. Login to admin dashboard
2. Go to `/admin/gadgets/new`
3. Fill form with all fields:
   - Product Name: "Apple MacBook Pro M3"
   - Price: 350000
   - Description: "High-performance laptop"
   - Category: Laptop
   - Brand: Apple
   - Processor: M3
   - Generation: 3rd Gen
   - RAM: 18GB
   - Storage: 512GB
   - Screen Size: 14"
4. Click "+ Choose Images"
5. Select image file
6. Image uploads to Vercel Blob
7. Click "Add Gadget" to save product
8. Product saves with image URL from Blob storage

---

**Once columns are added, everything will work!**
