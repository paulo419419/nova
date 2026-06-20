# Paystack Integration Testing Guide

## 📋 Overview

The Paystack payment integration is fully implemented and ready to use. This guide shows you how to set it up and test it.

## 🔑 Getting Your Paystack Keys

### Step 1: Create Paystack Account
1. Go to https://paystack.com
2. Sign up for an account
3. Complete verification

### Step 2: Get API Keys
1. Log into Paystack dashboard
2. Go to Settings → API Keys & Webhooks
3. Copy your keys:
   - **Public Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

**Important**: 
- Use `pk_test_` and `sk_test_` for testing
- Use `pk_live_` and `sk_live_` for production

## ⚙️ Configuration Steps

### Step 1: Add Paystack Keys to Admin Settings

1. Go to your app: `https://novagadgets.vercel.app/admin/login`
2. Login with your admin credentials
3. Navigate to `/admin/settings`
4. Click on "API Keys" tab
5. Fill in:
   - **Paystack Public Key**: `pk_test_xxxxxxx...`
   - **Paystack Secret Key**: `sk_test_xxxxxxx...`
6. Click "Save Settings"

### Step 2: Verify Keys are Saved
1. Refresh the page
2. The keys should still be visible in the form
3. If they're blank, check browser console for errors

## 🧪 Testing the Payment Flow

### Test Scenario 1: Complete Add to Cart

1. Go to Home page: `https://novagadgets.vercel.app/`
2. Select a budget (e.g., ₦200,000)
3. Select software (e.g., Adobe Premiere)
4. Click "Find Your Perfect Device"
5. Browse products
6. Click "View Details" on any product
7. Click "Add to Cart"
   - ✓ Green toast notification should appear
   - ✓ Shows "Added to Cart!"
   - ✓ Displays number of items

### Test Scenario 2: Checkout with Paystack

1. Click "View Cart" or Cart button
2. Review items and prices
3. Click "Checkout"
4. Fill in all required fields:
   - First Name
   - Last Name
   - Email (use test email)
   - Phone (use +234XXXXXXXXXX)
   - Address
   - State (select from dropdown)
5. Select "Pay with Paystack" as payment method
6. Click "Pay with Paystack"

### Test Scenario 3: Complete Payment

#### Using Paystack Test Card
1. Paystack modal will appear
2. Use test card details:
   - **Card Number**: 4084 0884 0884 0884
   - **CVV**: 408
   - **Expiry**: 01/32 (any future date)
   - **OTP**: 123456 (any 6 digits)

3. Click "Pay"
4. On success:
   - ✓ Modal closes
   - ✓ Order confirmation page displays
   - ✓ Order details shown
   - ✓ Confirmation email sent

## 📧 Verify Email Confirmation

### Check Email Was Sent
1. Check the email you used for checkout
2. Look for email from your configured sender (e.g., support@novagadgets.com)
3. Subject should contain: "Order Confirmation"
4. Email should show:
   - Order number
   - Product details
   - Shipping address
   - Estimated delivery date
   - Total amount paid

**Note**: If using Gmail SMTP, check Spam folder first

## ✅ Verify Order in Admin

### Check Order Was Created
1. Go to `/admin/dashboard`
2. Click "Orders" tab
3. You should see your test order:
   - Order number
   - Customer email
   - Total amount
   - Payment status: "Completed"
   - Order status: "Pending"

4. Click on order to view details:
   - All customer information
   - Questionnaire answers
   - Payment reference
   - Shipping details

## 🔧 Troubleshooting

### Issue: Paystack modal doesn't open
**Solution**:
- Verify `pk_test_` key is set correctly in admin settings
- Check browser console (F12) for JavaScript errors
- Make sure script loads: `https://js.paystack.co/v1/inline.js`
- Try clearing browser cache

### Issue: Payment succeeds but order not created
**Solution**:
- Check if orders table exists in Supabase
- Verify database connection is working
- Check browser console for errors
- Try again with a different email

### Issue: Confirmation email not received
**Solution**:
- Verify SMTP settings in Admin Settings → Email tab
- Check spam/junk folder
- Verify sender email is correct
- For Gmail: Enable "App passwords" if using 2FA

### Issue: "Could not find table 'public.orders'"
**Solution**:
1. Go to Supabase dashboard
2. SQL Editor
3. Run the SQL migration (see SQL commands below)
4. Verify table appears under Tables section
5. Try checkout again

## 🗄️ Database Setup SQL

If you get "orders table not found" error, run this SQL in Supabase:

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

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
```

## 💳 Paystack Test Cards

| Type | Card Number | CVV | Date |
|------|-------------|-----|------|
| Visa | 4084 0884 0884 0884 | 408 | 01/32 |
| Mastercard | 5061 0600 0600 0603 | 506 | 01/32 |
| Verve | 5061 0880 0880 0888 | 088 | 01/32 |

**OTP**: Any 6-digit number (e.g., 123456)

## 📊 Test Checklist

- [ ] Admin settings saved successfully
- [ ] Add to cart shows toast notification
- [ ] Cart count updates correctly
- [ ] Checkout form validates all fields
- [ ] Paystack modal opens when payment button clicked
- [ ] Test card payment succeeds
- [ ] Order appears in admin dashboard
- [ ] Confirmation email received
- [ ] Email contains order details
- [ ] Order status can be updated in admin

## 🚀 Go Live Steps

### When Ready for Production:

1. **Get Live Keys**:
   - Log into Paystack
   - Use live keys (`pk_live_`, `sk_live_`)

2. **Update Admin Settings**:
   - Replace test keys with live keys
   - Update email settings for production

3. **Deploy**:
   - Push changes to GitHub
   - Vercel auto-deploys
   - Verify on live URL

4. **Test Live**:
   - Use real Paystack cards
   - Test end-to-end flow
   - Monitor orders in admin

5. **Monitor**:
   - Check Paystack dashboard for transactions
   - Monitor email delivery
   - Track orders in admin panel

## 📞 Support

For Paystack issues:
- Visit: https://paystack.com/support
- Email: support@paystack.com
- Documentation: https://paystack.com/docs

For app issues:
- Check `FINAL_SETUP_CHECKLIST.md`
- Check browser console (F12)
- Check server logs in Vercel dashboard
