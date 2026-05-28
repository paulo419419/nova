# NOVA GADGETS - Quick Start Guide

## 🚀 What's New?

### 1. Better WhatsApp & TikTok Buttons
- Beautiful circular green button for WhatsApp
- Professional gray button for TikTok
- Smooth hover effects and transitions
- Fully responsive on all devices

### 2. Complete Database System
- All tables created and ready
- Product management system
- Customer inquiry tracking
- Review system
- User preferences storage

---

## ⚡ Getting Started (3 Easy Steps)

### Step 1: Set Up Database (5 minutes)

**Option A - Copy & Paste (Easiest)**
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to: SQL Editor → New Query
3. Copy entire contents of `/supabase/migrations/001_create_tables.sql`
4. Paste into SQL Editor and click **Run**
5. ✅ Done! All tables created

**Option B - Using API**
```bash
curl -X POST http://localhost:3000/api/admin/setup-database \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET_KEY"
```

### Step 2: Add Sample Products (Optional)

Go to Supabase → SQL Editor and run:

```sql
INSERT INTO products (name, category, description, price, currency, budget_tier, compatible_software, stock_quantity, is_featured)
VALUES 
  ('MacBook Pro M3', 'Laptops', 'Perfect for Adobe Premiere Pro', 1500.00, 'USD', 'above', 'adobe_premiere', 5, true),
  ('Dell XPS 15', 'Laptops', 'Great for DaVinci Resolve', 1200.00, 'USD', '300k', 'davinci_resolve', 3, true),
  ('iPhone 15 Pro', 'Mobile Phones', 'Excellent camera quality', 1099.00, 'USD', '300k', 'capcut', 10, true);
```

### Step 3: Start Using Database

In your Next.js components:

```typescript
import { getProducts, getProductsByBudget, getFeaturedProducts } from '@/lib/db/products'

// Server Component
export default async function ProductsPage() {
  const products = await getProducts()
  const featured = await getFeaturedProducts()
  const budgetProducts = await getProductsByBudget('300k')
  
  return (
    <div>
      {/* Use products data here */}
    </div>
  )
}
```

---

## 📁 Key Files

```
/supabase/migrations/
  └── 001_create_tables.sql          ← Database schema

/lib/db/
  ├── products.ts                     ← Product queries
  └── init.ts                         ← Database helpers

/app/api/admin/
  └── setup-database/route.ts         ← Setup endpoint

/DATABASE_SETUP.md                     ← Full documentation
/QUICK_START.md                        ← This file
```

---

## 🔧 Environment Variables

Make sure these are set in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
ADMIN_SECRET_KEY=your-secret-key
```

Get these from: Supabase Dashboard → Settings → API Keys

---

## 💡 Common Tasks

### Get All Products
```typescript
const products = await getProducts()
```

### Get Products by Budget
```typescript
const affordable = await getProductsByBudget('100k')
const premium = await getProductsByBudget('above')
```

### Get Products by Category
```typescript
const laptops = await getProductsByCategory('Laptops')
const phones = await getProductsByCategory('Mobile Phones')
```

### Get Featured Products
```typescript
const featured = await getFeaturedProducts()
```

### Get Single Product
```typescript
const product = await getProductById('product-id-here')
```

### Admin: Create Product
```typescript
import { createProduct } from '@/lib/db/products'

const newProduct = await createProduct({
  name: 'New Device',
  category: 'Laptops',
  price: 999.99,
  currency: 'USD',
  budget_tier: '300k',
  compatible_software: 'adobe_premiere',
  stock_quantity: 5,
  is_featured: true
})
```

### Admin: Update Product
```typescript
import { updateProduct } from '@/lib/db/products'

await updateProduct('product-id', {
  price: 1099.99,
  stock_quantity: 3,
  is_featured: false
})
```

### Admin: Delete Product
```typescript
import { deleteProduct } from '@/lib/db/products'

await deleteProduct('product-id')
```

---

## 📊 Database Schema Summary

### Products
- Store all gadgets with prices, specs, and categories
- Filter by: category, budget_tier, compatible_software
- Track: inventory, featured status, pricing

### Inquiries
- Customer name, email, phone
- Product interest
- Message/inquiry text
- Status tracking

### User Preferences
- Budget selection from questionnaire
- Software choice (CapCut, Adobe Premiere, DaVinci)
- Preferred product category

### Categories
- Laptops
- Mobile Phones
- Accessories
- Audio

### Reviews
- Product ratings (1-5 stars)
- Reviewer names
- Comment text

---

## 🎯 Next Steps

1. ✅ Set up database (Step 1 above)
2. ⏭️ Create `/products` page to display products
3. ⏭️ Add product filtering by budget & software
4. ⏭️ Create product detail pages
5. ⏭️ Connect WhatsApp button to inquiry form
6. ⏭️ Add reviews display system

---

## 🆘 Troubleshooting

**"Table not found" error?**
- Run the SQL migration again in Supabase SQL Editor
- Verify all tables exist in Table Editor

**Products not showing?**
- Check if you inserted sample data
- Verify Supabase connection is working
- Check environment variables are correct

**Permission errors?**
- Ensure SUPABASE_SERVICE_ROLE_KEY is set for admin operations
- Check Row Level Security (RLS) policies in Supabase

**Connection refused?**
- Ensure dev server is running: `npm run dev`
- Check that environment variables are loaded

---

## 📞 Support

- **WhatsApp:** +234 703 694 7900
- **TikTok:** @muhammad.the.edit
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

**Status:** ✅ Database configured and ready to use!
**Last Updated:** May 28, 2026
