# NOVA GADGETS - QUICK REFERENCE GUIDE

## URLs

| Page | URL | Purpose |
|------|-----|---------|
| Home | http://localhost:3000 | Landing page |
| Products | http://localhost:3000/products | Browse & filter devices |
| Cart | http://localhost:3000/cart | View cart items |
| Checkout | http://localhost:3000/checkout | Complete purchase |
| Order Status | http://localhost:3000/order-status | Track orders |
| Admin Login | http://localhost:3000/admin/login | Admin access |
| Admin Settings | http://localhost:3000/admin/settings | Config API keys |
| Admin Orders | http://localhost:3000/admin/orders | Manage orders |

---

## FEATURES IMPLEMENTED

### 1. Cart Badge
- Shows item count on Products page
- Red badge appears when items in cart
- Updates in real-time

### 2. Device Condition Filter
- New/Used toggle buttons
- Located below Price Range filter
- Works with other filters

### 3. Admin Settings - API Configuration
- Paystack Public & Secret keys
- Gmail Address & App Password
- Green "Configured" badges when saved
- Save directly from admin panel

### 4. WhatsApp Checkout
- Select "Pay Direct to Vendor" at checkout
- Click "Continue to WhatsApp"
- Opens WhatsApp with order details
- Pre-filled message with:
  - Products & quantities
  - Total price
  - Order ID
  - Customer info

### 5. Order Search Page
- Search by: Email, Phone, or Order ID
- Shows complete order details
- Displays 3 contact numbers
- All numbers are WhatsApp links

### 6. Contact Numbers
| Type | Number |
|------|--------|
| Main Support | +234 703 694 7900 |
| Sales Team | +234 803 XXX XXXX |
| Technical Support | +234 805 XXX XXXX |

---

## HOW TO USE EACH FEATURE

### Feature 1: Add to Cart with Badge
```
1. Go to /products
2. Click "Add to Cart" on any product
3. Red badge appears on Cart button
4. Badge shows item count (1, 2, 3, etc)
```

### Feature 2: Filter by Device Condition
```
1. Go to /products
2. Scroll to "Device Condition" section
3. Click "New" for new devices
4. Click "Used" for used devices
5. Click again to remove filter
```

### Feature 3: Set Up Paystack & Gmail
```
1. Go to /admin/settings
2. Log in with admin email
3. Click "API Configuration" tab
4. Enter Paystack keys:
   - Public Key: pk_live_xxxxx
   - Secret Key: sk_live_xxxxx
5. Enter Gmail credentials:
   - Gmail Address: your@gmail.com
   - App Password: xxxx xxxx xxxx xxxx
6. Click "Save All Settings"
7. Green "Configured" badge appears
```

### Feature 4: Complete WhatsApp Checkout
```
1. Go to /products
2. Add product to cart
3. Click "View Cart"
4. Click "Proceed to Checkout"
5. Fill delivery info (required):
   - First Name
   - Last Name
   - Email
   - Phone
   - Address
   - State
6. Select "Pay Direct to Vendor"
7. Click "Continue to WhatsApp"
8. WhatsApp opens with order details
```

### Feature 5: Search for Orders
```
1. Go to /order-status
2. Select search type:
   - Email: Enter your@gmail.com
   - Phone: Enter +234 803 123 4567
   - Order ID: Enter order ID
3. Click "Search Order"
4. View complete order details
5. Click contact numbers to message on WhatsApp
```

---

## ADMIN CREDENTIALS

**Default Admin Account:**
- Email: admin@novagadgets.com
- Password: [Set during initial setup]

**Access:**
- Admin Settings: /admin/settings
- Admin Orders: /admin/orders

---

## TROUBLESHOOTING

### Cart Badge Not Showing
- Check if cart has items (add a product first)
- Refresh the page
- Check browser console for errors

### WhatsApp Not Opening
- Make sure phone number field is filled
- Check popup blocker settings
- Try opening in incognito mode

### Paystack Keys Not Saving
- Check Supabase connection
- Verify permissions in admin_settings table
- Check "Save All Settings" button was clicked

### Order Search Not Finding Orders
- Use exact email or phone number
- Make sure order exists in database
- Try different search method (Email vs Phone)

### Admin Login Issues
- Check email spelling (admin@novagadgets.com)
- Reset password if forgotten
- Check Supabase Auth is configured

---

## DATABASE SCHEMA

### Orders Table Columns:
- id (UUID)
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- customer_state (text)
- customer_address (text)
- items (JSON)
- subtotal (integer)
- shipping_cost (integer)
- total_price (integer)
- payment_method ('paystack' | 'whatsapp')
- payment_status ('pending' | 'completed' | 'failed')
- order_status (text)
- paystack_reference (text)
- created_at (timestamp)
- updated_at (timestamp)

### Admin Settings Table Columns:
- id (UUID)
- setting_key (text, unique)
- setting_value (text/JSON)
- created_at (timestamp)
- updated_at (timestamp)

**Stored Settings:**
- `paystack_config` - JSON with publicKey & secretKey
- `email_config` - JSON with gmailAddress & gmailAppPassword
- `whatsapp_numbers` - JSON array of contact numbers

---

## API ENDPOINTS

### Public APIs:
- `GET /api/products` - List products
- `POST /checkout` - Create order
- `POST /api/send-confirmation-email` - Send order confirmation

### Admin APIs:
- `GET /api/admin/settings/paystack` - Get Paystack config
- `POST /api/admin/settings/paystack` - Save Paystack config
- `GET /api/admin/settings/email` - Get email config
- `POST /api/admin/settings/email` - Save email config

---

## KEYBOARD SHORTCUTS

| Action | Shortcut |
|--------|----------|
| Go to Products | `/products` |
| Go to Order Status | `/order-status` |
| Go to Admin | `/admin/settings` |

---

## SUPPORT

For issues or questions:
1. Check IMPLEMENTATION_COMPLETE.md for detailed info
2. Message on WhatsApp: +234 703 694 7900
3. Review console logs for error messages

---

## VERSION INFO

- Next.js: 16+
- React: 19+
- Supabase: Latest
- TailwindCSS: v4

Last Updated: 2026-06-21
