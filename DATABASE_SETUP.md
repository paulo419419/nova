# Database Setup Guide for NOVA GADGETS

This guide explains how to set up and configure all the databases for the NOVA GADGETS application.

## Overview

The application uses **Supabase** (PostgreSQL) for data persistence. The following tables are configured:

- **products**: Store all gadgets and devices
- **inquiries**: Customer inquiries and messages
- **user_preferences**: User budget and software choices
- **categories**: Product categories
- **reviews**: Customer reviews and ratings

## Prerequisites

- Supabase project created and connected
- Environment variables configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Setup Steps

### Option 1: Manual Setup (Recommended)

1. **Access Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to the **SQL Editor** section

2. **Create Tables**
   - Copy the entire SQL from `supabase/migrations/001_create_tables.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press **Ctrl+Enter**

3. **Verify Tables**
   - Check the **Table Editor** to confirm all tables are created:
     - products
     - inquiries
     - user_preferences
     - categories
     - reviews

### Option 2: Using API Endpoint

1. **Set Admin Secret**
   - Add `ADMIN_SECRET_KEY` to your environment variables

2. **Call Setup Endpoint**
   ```bash
   curl -X POST http://localhost:3000/api/admin/setup-database \
     -H "Authorization: Bearer YOUR_ADMIN_SECRET_KEY"
   ```

## Table Schemas

### Products Table
```sql
- id (UUID, PRIMARY KEY)
- name (VARCHAR(255))
- category (VARCHAR(100))
- description (TEXT)
- price (DECIMAL)
- currency (VARCHAR(3))
- specs (TEXT)
- budget_tier (VARCHAR(50))
- compatible_software (VARCHAR(255))
- image_url (VARCHAR(500))
- stock_quantity (INTEGER)
- is_featured (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Inquiries Table
```sql
- id (UUID, PRIMARY KEY)
- customer_name (VARCHAR(255))
- customer_email (VARCHAR(255))
- customer_phone (VARCHAR(20))
- product_id (UUID, FOREIGN KEY)
- inquiry_type (VARCHAR(50))
- message (TEXT)
- status (VARCHAR(50))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### User Preferences Table
```sql
- id (UUID, PRIMARY KEY)
- budget (VARCHAR(50))
- software_choice (VARCHAR(100))
- preferred_category (VARCHAR(100))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Categories Table
```sql
- id (UUID, PRIMARY KEY)
- name (VARCHAR(100), UNIQUE)
- description (TEXT)
- icon_url (VARCHAR(500))
- created_at (TIMESTAMP)
```

### Reviews Table
```sql
- id (UUID, PRIMARY KEY)
- product_id (UUID, FOREIGN KEY)
- reviewer_name (VARCHAR(255))
- rating (INTEGER, 1-5)
- comment (TEXT)
- created_at (TIMESTAMP)
```

## Inserting Sample Data

After creating tables, you can insert sample products:

```sql
INSERT INTO products (name, category, description, price, currency, budget_tier, compatible_software, stock_quantity, is_featured)
VALUES 
  ('MacBook Pro M3', 'Laptops', 'Perfect for Adobe Premiere Pro', 1500.00, 'USD', 'above', 'adobe_premiere', 5, true),
  ('Dell XPS 15', 'Laptops', 'Great for DaVinci Resolve', 1200.00, 'USD', '300k', 'davinci_resolve', 3, true),
  ('iPhone 15 Pro', 'Mobile Phones', 'Excellent camera for video recording', 1099.00, 'USD', '300k', 'capcut', 10, true);
```

## Useful Database Functions

The application provides helper functions in `lib/db/products.ts`:

```typescript
// Get all products
getProducts()

// Get products by category
getProductsByCategory('Laptops')

// Get products by budget
getProductsByBudget('300k')

// Get featured products
getFeaturedProducts()

// Get single product
getProductById(productId)

// Admin: Create product
createProduct(productData)

// Admin: Update product
updateProduct(productId, updates)

// Admin: Delete product
deleteProduct(productId)
```

## Connection String

If you need to connect via PostgreSQL client:

```
postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
```

Get your connection string from:
- Supabase Dashboard → Settings → Database → Connection string

## Environment Variables

Make sure these are set in your `.env.local` or Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET_KEY=your-admin-secret-key
```

## Troubleshooting

### Tables Not Appearing
- Ensure SQL was executed successfully in Supabase editor
- Check the "Run" output for any errors
- Refresh the page in Supabase dashboard

### Connection Issues
- Verify environment variables are correct
- Check Supabase project status
- Ensure your IP is not blocked (check Auth settings)

### Permission Errors
- Use the Service Role Key for admin operations
- Verify Row Level Security (RLS) policies if needed

## Next Steps

1. ✅ Set up all database tables
2. ✅ Configure environment variables
3. ⏭️ Create API routes for CRUD operations
4. ⏭️ Build product listing pages
5. ⏭️ Implement inquiry submission via WhatsApp
6. ⏭️ Set up reviews and ratings system

## Support

For issues with Supabase:
- Visit: https://supabase.com/docs
- Contact Supabase Support: https://supabase.com/support

For issues with this app:
- Check WhatsApp: +234 703 694 7900
- Visit: https://www.tiktok.com/@muhammad.the.edit
