# Admin Setup Guide

## Overview

This guide walks you through setting up the admin system for NOVA GADGETS, including creating the first admin user and configuring permissions.

## Step 1: Run Database Migration

First, you need to run the database migration to create the necessary tables.

### Option A: Via Supabase Dashboard

1. Go to your Supabase Project Dashboard
2. Navigate to **SQL Editor**
3. Open `/supabase/migrations/001_create_tables.sql`
4. Copy all the SQL code
5. Paste it into the SQL Editor
6. Click **Run**

The migration creates:
- `admin_users` table - for managing admin accounts
- `product_images` table - for storing multiple images per product
- Related indexes for performance

### Option B: Via CLI (if you have Supabase CLI set up)

```bash
supabase db push
```

## Step 2: Create the First Admin User

Now create the primary admin account with the credentials:
- **Email:** `juliusokpanachi419@gmail.com`
- **Password:** `12345678`

### Via API Endpoint

Make a POST request to `/api/admin/seed` with:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juliusokpanachi419@gmail.com",
    "password": "12345678"
  }'
```

### Response Example

```json
{
  "message": "Admin user created successfully",
  "admin": {
    "id": "user-uuid-here",
    "email": "juliusokpanachi419@gmail.com",
    "is_super_admin": true
  }
}
```

## Step 3: Log In to Admin Dashboard

1. Go to `http://localhost:3000/admin/login`
2. Enter credentials:
   - Email: `juliusokpanachi419@gmail.com`
   - Password: `12345678`
3. Click "Sign In"
4. You'll be redirected to the Admin Dashboard

## Step 4: Add More Admins (Super Admin Only)

Only the first admin (super admin) can add other admins.

1. From the Admin Dashboard, click "Add New Admin"
2. Fill in the new admin's email and password
3. Click "Create Admin Account"

**Important:** Only accounts created by a super admin will have access. Regular admins cannot create new admins.

## Features

### Admin Capabilities

Once logged in, admins can:

#### 1. Add Products/Gadgets
- Upload **multiple images** per product (first image is primary, others are stored in `product_images` table)
- Set product details: name, price, category, specifications
- Configure compatibility with video editing software
- Set stock status

#### 2. Manage Products
- View all products
- Edit product details
- Delete products
- Update inventory

#### 3. Manage Admins (Super Admin Only)
- View all admin accounts
- Add new admin users
- Can modify admin permissions in future updates

### Multi-Image Upload

When adding a new product, admins can upload multiple images:

1. **Click "Choose Images"** to select multiple files
2. **Preview** all selected images before uploading
3. **Remove images** by hovering and clicking the X button
4. **First image** automatically becomes the primary product image
5. **Additional images** are stored in the `product_images` table for use in product galleries

**Image Storage:**
- Primary image: stored in `products.image_url`
- Additional images: stored in `product_images.image_url`
- All images: stored in Supabase Storage under `gadget-images` bucket

## Database Schema

### admin_users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### product_images Table

```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Create First Admin
- **POST** `/api/admin/seed`
- **Body:** `{ "email": string, "password": string }`
- **Response:** Created admin user object
- **Note:** Can only be called once per email

### Add Admin (Super Admin Only)
- **POST** `/api/admin/add-admin`
- **Requires:** Active session as super admin
- **Body:** `{ "newAdminEmail": string, "newAdminPassword": string }`
- **Response:** Created admin user object

### Admin Login
- **Route:** `/admin/login`
- **Method:** Sign in via Supabase Auth
- **Verification:** Email must exist in `admin_users` table

## Security Notes

1. **Super Admin Requirement:** Only the first admin (marked as `is_super_admin: true`) can create additional admins
2. **Auth Integration:** All admin accounts are tied to Supabase Auth service
3. **Database Validation:** Admin status is verified in `admin_users` table on every login
4. **Service Role:** Admin operations use the Supabase service role key for elevated permissions

## Troubleshooting

### Admin Can't Log In
- Verify email exists in `admin_users` table
- Check that Supabase Auth is properly configured
- Ensure password is correct

### Can't Add New Admin
- Only super admins (first admin) can add new admins
- Current user must be logged in and verified as admin
- Check that admin account was created successfully

### Images Not Uploading
- Check that Supabase Storage `gadget-images` bucket exists
- Verify file permissions on the bucket
- Ensure image files are under 10MB
- Check browser console for specific error messages

### Database Migration Errors
- Make sure Supabase project is properly connected
- Check environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Verify tables don't already exist before running migration
- Check for SQL syntax errors in the migration file

## Future Enhancements

Potential improvements to consider:

1. **Role-Based Permissions:** Add different permission levels beyond super admin/regular admin
2. **Audit Logging:** Track all admin actions and changes
3. **Image Reordering:** Allow dragging to reorder product images
4. **Bulk Operations:** Upload multiple products at once
5. **Admin Deactivation:** Soft-delete admin accounts
6. **Session Management:** View and manage active admin sessions
7. **Two-Factor Authentication:** Additional security for admin accounts
8. **Activity Reports:** Admin activity logs and analytics

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review your Supabase project logs
3. Verify all environment variables are correctly set
4. Check browser developer console for error messages
