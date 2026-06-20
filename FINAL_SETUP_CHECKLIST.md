# NOVA GADGETS - Final Setup & Deployment Checklist

## ✅ Features Implemented & Working

### 1. **Add to Cart Functionality** ✓
- Toast notification displays for 3 seconds when item added
- Shows "✓ Added to Cart! 1 item(s) added"
- Cart count badge appears in header
- **Status**: Working - Fixed NaN count issue

### 2. **Product Detail Page** ✓
- Full product information display
- Compatible software tags
- Specifications display
- Image gallery
- **Status**: Fully functional

### 3. **Light Theme Applied** ✓
- White backgrounds instead of dark navy
- Clean, professional appearance
- Better readability and contrast
- **Status**: Deployed

### 4. **Payment Methods** (Needs Configuration)

#### Paystack Integration
- **Status**: Ready - needs API key setup
- **Action Required**:
  1. Go to `/admin/settings` (must be logged in as admin)
  2. Click "API Keys" tab
  3. Enter your Paystack Public Key in "Paystack Public Key" field
  4. Save settings
  5. Payment will work automatically

#### WhatsApp Payment
- **Status**: Ready - configured with vendor WhatsApp: +2347036947900
- **No action needed** - will open WhatsApp automatically

### 5. **Order Management** ✓
- Orders table defined in Supabase migrations
- Admin can view orders at `/admin/orders`
- Full order tracking with status updates
- **Status**: Ready to use

### 6. **Email Confirmations** ✓
- Automated order confirmation emails
- Sends after Paystack payment OR WhatsApp order
- **Status**: Configured - SMTP settings needed in Admin Settings

### 7. **Cart Count Indicator** ✓
- Badge shows number of items in cart
- Updates in real-time
- Displays in header
- **Status**: Fixed and working

## 🔧 Required Setup Steps

### Step 1: Configure Admin Settings
1. Login to `/admin/login` with your admin credentials
2. Go to `/admin/settings`
3. Configure three tabs:

**A. API Keys Tab**
- Paystack Public Key: `pk_live_xxxxx` (get from Paystack dashboard)
- Paystack Secret Key: `sk_live_xxxxx` (for backend verification)
- WhatsApp Number: `+2347036947900` (already set)

**B. Email Settings Tab**
- Sender Email: Your business email (e.g., support@novagadgets.com)
- SMTP Host: smtp.gmail.com (for Gmail) or your provider
- SMTP Port: 587
- SMTP Username: Your email address
- SMTP Password: Your app password (not regular password)

**C. Brands/Software/Processors Tab**
- Add custom options for your products

### Step 2: Deploy Database Migrations
The orders table migration is in: `/supabase/migrations/005_update_device_conditions.sql`

**To apply manually in Supabase:**
1. Go to Supabase dashboard
2. SQL Editor
3. Copy and run this SQL:

```sql
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gadget_id UUID REFERENCES products(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address VARCHAR(500),
  customer_city VARCHAR(100),
  customer_state VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(10,2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'pending',
  order_notes TEXT,
  questionnaire_data JSONB,
  paystack_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### Step 3: Test Complete Flow

1. **Add to Cart Test**:
   - Go to Products
   - Click View Details on any product
   - Click Add to Cart
   - ✓ Toast notification should appear
   - ✓ Cart badge should update

2. **Checkout Test**:
   - Go to cart
   - Click Checkout
   - Fill delivery information
   - Select payment method (Paystack or WhatsApp)
   - Process payment
   - ✓ Confirmation email should be sent (check email settings)
   - ✓ Order should appear in Admin Orders page

3. **Admin Verification**:
   - Login to admin
   - Go to Orders page
   - Should see test order with all details
   - Click to view full order details
   - Can update order status

### Step 4: Environment Variables
Make sure these are set in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_xxxxx (optional - can be set in admin)
```

## 🚀 Deployment Steps

1. **Build & Test Locally**:
   ```bash
   npm run build
   npm run dev
   ```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup: Configure Paystack, email, and order management"
   git push origin main
   ```

3. **Deploy to Vercel**:
   - Connect repository if not already done
   - Vercel will auto-deploy
   - Set environment variables in Vercel dashboard

4. **Verify Live**:
   - Test add to cart on live site
   - Verify toast notification appears
   - Verify cart count updates
   - Test checkout (use Paystack test keys for testing)

## 📧 Email Configuration Examples

### Gmail
- Host: smtp.gmail.com
- Port: 587
- Username: your-email@gmail.com
- Password: Your app password (NOT your regular password)
  - Generate at: https://myaccount.google.com/apppasswords

### SendGrid
- Host: smtp.sendgrid.net
- Port: 587
- Username: apikey
- Password: SG.xxxxxxxxxxxxxxxx

### AWS SES
- Host: email-smtp.REGION.amazonaws.com
- Port: 587
- Username: Your SES SMTP username
- Password: Your SES SMTP password

## ✅ Testing Checklist

- [ ] Add to cart shows toast (3 seconds)
- [ ] Cart badge updates with item count
- [ ] Checkout form validates required fields
- [ ] Paystack integration processes payment
- [ ] WhatsApp button opens correct chat
- [ ] Order appears in Admin Orders page
- [ ] Confirmation email is received
- [ ] Email contains order details correctly
- [ ] Admin can update order status
- [ ] Admin can add order notes

## 🐛 Troubleshooting

### Toast not showing
- Check browser console for JavaScript errors
- Ensure `useStore()` hook is working
- Verify cart state is updating

### Paystack not working
- Verify `NEXT_PUBLIC_PAYSTACK_KEY` is set correctly
- Check Paystack dashboard for API key
- Ensure it's a LIVE key (pk_live_) not TEST key

### Emails not sending
- Verify SMTP credentials in Admin Settings
- Check spam folder
- Enable "Less Secure Apps" if using Gmail
- Verify sender email is correct

### Orders table error
- Run the SQL migration in Supabase
- Verify table appears in Supabase dashboard
- Check table has all required columns

## 📞 Support

For issues:
1. Check the TROUBLESHOOTING section above
2. Review console logs for errors
3. Verify all settings in Admin Settings page
4. Check database tables in Supabase dashboard
