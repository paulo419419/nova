# Admin Quick Reference Guide

## Your Admin Account

**Email:** `juliusokpanachi419@gmail.com`
**Password:** `12345678`
**Role:** Super Admin (can add other admins)

---

## Setup in 3 Steps

### 1️⃣ Run Database Migration
Go to Supabase Dashboard → SQL Editor → Run migration file:
```sql
-- Copy from: supabase/migrations/001_create_tables.sql
-- Paste into SQL Editor and click Run
```

### 2️⃣ Create Admin Account
Make a POST request:
```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"email": "juliusokpanachi419@gmail.com", "password": "12345678"}'
```

### 3️⃣ Log In
Visit: `http://localhost:3000/admin/login`

---

## Key Features

### ✅ Multi-Image Upload
- Upload multiple images per product
- Drag & drop or click to upload
- Preview all images before saving
- Remove individual images
- First image = primary product image
- Other images = product gallery images

### ✅ Admin-Only Actions
- **Add Products:** `/admin/gadgets/new`
- **Add Admins:** `/admin/add-admin` (Super Admin Only)
- **View Dashboard:** `/admin/dashboard`

### ✅ Super Admin Powers
- Create new admin accounts
- Only super admin can add admins
- Regular admins cannot create new admins

---

## Important URLs

| Page | URL |
|------|-----|
| Admin Login | `/admin/login` |
| Admin Dashboard | `/admin/dashboard` |
| Add Product | `/admin/gadgets/new` |
| Add Admin | `/admin/add-admin` |
| Setup API | `/api/admin/seed` |

---

## Database Tables

### admin_users
Stores admin account information
- `id` - User ID (from auth)
- `email` - Admin email
- `is_super_admin` - Boolean (true only for first admin)

### product_images
Stores additional product images
- `product_id` - Links to product
- `image_url` - Image URL in storage
- `display_order` - Order in gallery

---

## Common Tasks

### Add a New Product with Multiple Images
1. Go to `/admin/gadgets/new`
2. Fill in all product details
3. Click "Choose Images"
4. Select multiple image files
5. See previews in grid
6. Click "Add Gadget" to save
   - First image → products.image_url
   - Other images → product_images table

### Create Another Admin (Super Admin Only)
1. Go to `/admin/add-admin`
2. Enter new admin email & password
3. Click "Create Admin Account"
4. New admin can now log in

### Remove an Image from Upload
1. Hover over image in preview grid
2. Click the red X button
3. Image removed from selection

---

## Troubleshooting

**Can't log in?**
- Verify email: `juliusokpanachi419@gmail.com`
- Verify password: `12345678`
- Check that seed endpoint was called successfully

**Can't add admin?**
- Only super admins can add new admins
- Your account must have `is_super_admin: true`
- Verify you're logged in

**Images not uploading?**
- Check file size (max 10MB each)
- Verify Supabase Storage bucket exists
- Check browser console for errors

**Database migration failed?**
- Make sure Supabase project is connected
- Check environment variables
- Verify no syntax errors in SQL

---

## API Examples

### Create First Admin
```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juliusokpanachi419@gmail.com",
    "password": "12345678"
  }'
```

### Create Additional Admin
```bash
curl -X POST http://localhost:3000/api/admin/add-admin \
  -H "Content-Type: application/json" \
  -d '{
    "newAdminEmail": "admin2@example.com",
    "newAdminPassword": "password123"
  }'
```

---

## File Locations

| File | Purpose |
|------|---------|
| `supabase/migrations/001_create_tables.sql` | Database schema |
| `app/api/admin/seed/route.ts` | Create first admin |
| `app/api/admin/add-admin/route.ts` | Create more admins |
| `app/admin/gadgets/new/page.tsx` | Add products with images |
| `ADMIN_SETUP.md` | Detailed setup guide |
| `IMPLEMENTATION_SUMMARY.md` | Full feature documentation |

---

## Quick Checklist

- [ ] Database migration run
- [ ] First admin created via seed endpoint
- [ ] Can log in with admin credentials
- [ ] Can add new product with multiple images
- [ ] Can upload and preview images
- [ ] Images save correctly

---

## Support

For more details:
- **Full Setup Guide:** `ADMIN_SETUP.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Database Schema:** `supabase/migrations/001_create_tables.sql`

Need help? Check the troubleshooting sections in the guides above.
