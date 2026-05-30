# Supabase Storage Bucket Setup

## Problem
The gadget images upload fails with: `StorageApiError: Bucket not found`

## Solution
You need to create the `gadget-images` storage bucket in Supabase. Follow these steps:

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project

### Step 2: Create Storage Bucket
1. In the left sidebar, click **Storage**
2. Click the **Create a new bucket** button
3. Fill in the bucket name: `gadget-images`
4. Set it as **Public** (toggle ON)
5. Click **Create bucket**

### Step 3: Configure Policies (Optional but Recommended)
Once the bucket is created, you can set Row Level Security (RLS) policies:

1. Select the `gadget-images` bucket
2. Click on the **Policies** tab
3. Click **New Policy** → **For full customization**
4. Create a policy to allow authenticated users to upload:
   - Policy name: `Allow authenticated uploads`
   - Roles: authenticated
   - Operations: INSERT
   - Target: (bucket) = 'gadget-images'

### Step 4: Test Upload
1. Log back into your admin dashboard
2. Go to: `/admin/gadgets/new`
3. Try uploading an image using:
   - Click "+ Choose Images" to open file picker
   - Or drag & drop an image
4. Image should upload successfully

## If Still Having Issues

1. **Check Bucket Exists:**
   - Go to Supabase Dashboard → Storage
   - You should see `gadget-images` in the list

2. **Check Bucket is Public:**
   - Click on the bucket
   - Verify the privacy toggle is ON (public access)

3. **Check Browser Console:**
   - Open browser Developer Tools (F12)
   - Go to Console tab
   - Look for any error messages with [v0] prefix
   - Share these errors for debugging

4. **Test with API:**
   - Open Supabase SQL Editor
   - Run: `SELECT name, public FROM storage.buckets WHERE name = 'gadget-images';`
   - Should return one row with public = true

## Manual Bucket Creation via SQL
If the UI method doesn't work, use SQL directly in Supabase SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('gadget-images', 'gadget-images', true);
```

Then grant access:
```sql
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'gadget-images');
```

