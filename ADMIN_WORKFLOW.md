# NOVA GADGETS - Admin Workflow & Security Guide

## Overview

Your NOVA GADGETS store now has a complete admin system with:
- Email-based admin authentication
- Admin-only admin creation (only existing admins can create new admins)
- No email verification delays
- Secure API endpoints with authorization checks

---

## Admin Workflow

### Step 1: First Admin Setup

Since no admins exist yet, you need to create the first admin directly via Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query to create your first admin account:

```sql
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
  last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'your-email@example.com',
  crypt('your-password', gen_salt('bf')),
  now(),
  now(),
  '{}',
  '{}',
  now(),
  now()
);

-- Get the user ID from the previous INSERT and use it here
INSERT INTO public.admin_users (id, email)
VALUES ((SELECT id FROM auth.users WHERE email = 'your-email@example.com'), 'your-email@example.com');
```

**Replace:**
- `your-email@example.com` with your admin email
- `your-password` with your admin password

---

### Step 2: Login as Admin

1. Go to `/admin/login`
2. Enter your email and password
3. You'll be redirected to the admin dashboard

---

### Step 3: Add New Admin Accounts

Once logged in:

1. Go to the **Admins** tab in the dashboard
2. Click **"Add New Admin"** button
3. Enter the new admin's email and password
4. Click **"Create Admin Account"**
5. The new admin can immediately log in with their credentials

---

## Security Features

✅ **Only Admins Can Create Admins**
- The `/api/admin/add-admin` endpoint checks if the current user is in the `admin_users` table
- Non-admins are rejected with a 403 Forbidden response
- Unauthorized users get a 401 Unauthorized response

✅ **No Self-Signup**
- The admin login page only allows login, not signup
- Users cannot create admin accounts without authorization

✅ **Automatic Email Confirmation**
- New admin accounts are automatically confirmed
- No email verification delays
- New admins can log in immediately

✅ **Session-Based Authentication**
- All protected pages check authentication in the browser using `createClient()`
- Unauthorized users are redirected to `/admin/login`
- Session management is handled automatically via cookies

---

## File Structure

```
app/
├── admin/
│   ├── login/page.tsx           # Admin login page
│   ├── dashboard/page.tsx        # Admin dashboard (protected)
│   └── add-admin/page.tsx        # Add new admin page (protected)
├── api/
│   └── admin/
│       └── add-admin/route.ts   # Admin creation API (protected)
lib/
├── supabase/
│   ├── client.ts               # Browser client for session management
│   ├── server.ts               # Server client for middleware
│   └── server-admin.ts         # Admin client with service role key
```

---

## Environment Variables Required

The following are automatically set by Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (used for admin operations)

---

## Troubleshooting

### "Unauthorized - not logged in" Error
- Make sure you're logged in by visiting `/admin/login`
- Check browser cookies are enabled
- The Supabase session cookie should be present

### "Unauthorized - not an admin" Error
- Your email is not in the `admin_users` table
- Contact another admin to add you using the "Add New Admin" feature
- Or insert your record directly in Supabase

### New Admin Can't Log In
- Check the email is correct in the `admin_users` table
- Verify the password is correct
- The password must match exactly (it's case-sensitive)

---

## API Reference

### POST /api/admin/add-admin

**Authentication:** Required (must be logged in as admin)

**Request Body:**
```json
{
  "newAdminEmail": "admin@example.com",
  "newAdminPassword": "securepassword"
}
```

**Success Response (201):**
```json
{
  "message": "Admin created successfully",
  "admin": {
    "id": "uuid",
    "email": "admin@example.com"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - User not logged in
- `403 Forbidden` - User is not an admin
- `400 Bad Request` - Missing email or password, or email already exists
- `500 Internal Server Error` - Database error

---

## Best Practices

1. **Strong Passwords**: Use secure, complex passwords for admin accounts
2. **Limited Access**: Only create admin accounts for trusted people
3. **Regular Audits**: Periodically review who has admin access
4. **Backup Access**: Keep at least 2 admin accounts for backup access
5. **Rotate Credentials**: Change passwords periodically

---

## Questions or Issues?

If you encounter any issues with the admin system, check:
1. Supabase project is connected properly
2. Environment variables are set in project settings
3. Database tables exist and have proper permissions
4. Browser cookies are enabled
