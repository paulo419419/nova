# Admin User Guide

## Account Management

### Access Your Profile
1. Log in to the admin dashboard at `/admin/login`
2. Click the **"Profile"** button in the top right
3. You'll see three sections: Current Account, Change Email, Change Password

### Change Your Password
1. Go to Admin Profile page
2. Scroll to "Change Password" section
3. Enter your current password
4. Enter new password (minimum 6 characters)
5. Confirm new password
6. Click "Update Password"

### Change Your Email
1. Go to Admin Profile page
2. Scroll to "Change Email" section
3. Enter your new email address
4. Click "Update Email"
5. Check the new email for verification link
6. Click the link to confirm the change

### Logout
1. Go to Admin Profile page
2. Scroll to bottom
3. Click "Logout" button

---

## Adding Products (Gadgets)

### Access Product Creation
1. From Dashboard, click "Add New Gadget" button
2. Or navigate to `/admin/gadgets/new`

### Upload Multiple Images
1. Click "Choose Images" button
2. Select multiple image files at once
3. Images display in grid preview
4. Remove unwanted images by hovering and clicking X
5. First image becomes the primary product image

### Fill Product Details
1. **Product Name** - Name of the gadget
2. **Price (N)** - Price in Naira
3. **Category** - Choose from: Laptop, Mobile Phone, AirPods, Tablet, etc.
4. **Description** - Product description
5. **Brand** - Select from available brands
6. **Processor** - CPU type (e.g., Core i7, Ryzen 9)
7. **Processor Generation** - Generation (e.g., 12th Gen)
8. **RAM (GB)** - Memory in GB
9. **Storage (GB)** - Storage capacity
10. **Screen Size** - Display size in inches
11. **Graphics** - GPU type
12. **Compatible Software** - Select: Adobe Premiere, DaVinci Resolve, CapCut
13. **Price Category** - Budget tier
14. **Stock Status** - In Stock checkbox

### Save Product
1. Click "Add Gadget" button
2. Product saves with all images
3. First image is primary
4. Additional images stored separately
5. You'll be redirected to dashboard

---

## Troubleshooting

### "Could not find table" Error
✅ **FIXED** - All table references updated to use `products` table

### Product Won't Save
- Ensure all required fields are filled (marked with *)
- Check that at least one image is uploaded
- Try refreshing and trying again

### Image Upload Issues
- Check file size (max 10MB per image)
- Ensure format is PNG, JPG, or GIF
- Try uploading fewer images at once

### Password Change Fails
- Current password must be correct
- New password must be 6+ characters
- Passwords must match in confirmation field

### Email Change Not Confirming
- Check spam/junk folder
- Make sure new email is correct
- Verify link expires after 24 hours

---

## Keyboard Shortcuts

- `Tab` - Navigate between form fields
- `Enter` - Submit forms
- `Escape` - Cancel some dialogs

---

## Admin Credentials

**Email:** juliusokpanachi419@gmail.com
**Password:** 12345678

*Note: Change your password immediately after first login for security*

---

## Contact & Support

For issues or feature requests, contact the development team.

**Last Updated:** May 2026
