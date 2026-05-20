# NOVA GADGETS - Setup & Installation Guide

## Overview
NOVA GADGETS is a premium e-commerce platform for video editing gadgets (laptops, phones, tablets) designed specifically for video editors. The site features an intelligent questionnaire to recommend products based on budget and video editing software preferences.

## Features Implemented

### Customer Features
1. **Smart Questionnaire Welcome Screen**
   - Budget selection (₦100,000, ₦200,000, ₦300,000, Above ₦300,000)
   - Video editing software preference (Adobe Premiere, DaVinci Resolve, CapCut)
   - Automatic RAM recommendation based on software choice
   - Smart filtering of products based on questionnaire answers

2. **Product Browsing**
   - Filter by price category
   - Filter by software compatibility
   - Filter by RAM specification
   - Responsive mobile-first design
   - Product details with specifications

3. **Shopping Experience**
   - Add products to cart
   - View cart with product summaries
   - Edit quantities
   - Remove items from cart

4. **Checkout Options**
   - **Paystack Integration**: Online payment processing (Naira currency)
   - **WhatsApp Direct Payment**: For customers preferring direct vendor communication
   - WhatsApp redirect to +2347036947900 for direct payment inquiries
   - Order confirmation and summary

### Admin Panel Features
1. **Admin Authentication**
   - Email-based login with Supabase Auth
   - Multiple admin accounts support
   - Secure session management

2. **Gadget Management**
   - Add new gadgets with detailed specifications
   - Edit existing gadget information
   - Delete gadgets
   - Upload and manage product images (stored in Supabase Storage)
   - Stock status management (in stock / out of stock)

3. **Gadget Specifications**
   - Brand selection
   - Processor type and generation
   - RAM capacity (4GB, 8GB, 16GB, 32GB)
   - Storage capacity
   - Screen size
   - Graphics card info
   - Compatible video editing software selection

4. **Order Management**
   - View all orders
   - Track payment status
   - Customer information display
   - Order details and timestamps

## Database Schema

### Tables

#### `gadgets`
- `id`: UUID (Primary Key)
- `name`: Product name
- `description`: Product description
- `price`: DECIMAL in Naira
- `image_url`: URL to product image
- `category`: Device type (laptop, phone, tablet)
- `brand`: Manufacturer name
- `processor`: Processor type
- `processor_generation`: Generation (7th, 10th, etc.)
- `ram_gb`: RAM in gigabytes
- `storage_gb`: Storage in gigabytes
- `screen_size`: Display size in inches
- `graphics`: GPU information
- `compatible_software`: Array of supported software
- `price_category`: Price bracket (100k, 200k, 300k, 400k, above_400k)
- `is_in_stock`: Stock availability
- `created_at`, `updated_at`: Timestamps

#### `orders`
- `id`: UUID (Primary Key)
- `gadget_id`: Reference to gadgets table
- `customer_name`: Buyer's name
- `customer_email`: Buyer's email
- `customer_phone`: Buyer's phone number
- `quantity`: Number of items
- `total_price`: Total order amount in Naira
- `payment_method`: 'paystack' or 'whatsapp'
- `payment_status`: 'pending', 'completed', or 'failed'
- `paystack_reference`: Paystack transaction reference
- `questionnaire_data`: JSONB - stores budget and software preferences
- `created_at`, `updated_at`: Timestamps

#### `admin_users`
- `id`: UUID (Primary Key)
- `email`: Admin email address (unique)
- `created_at`: Registration timestamp

## Setup Instructions

### 1. Environment Variables
Add the following environment variables to your `.env.local` file:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Paystack
NEXT_PUBLIC_PAYSTACK_KEY=<your-paystack-public-key>
PAYSTACK_SECRET_KEY=<your-paystack-secret-key>
```

### 2. Supabase Setup
- Ensure Supabase integration is connected
- Database schema has been automatically created
- Row Level Security (RLS) is enabled on all tables
- Storage bucket "gadget-images" is configured for image uploads

### 3. Admin Account Creation
To create an admin account:
1. Navigate to `/admin/login`
2. Click "Create one" under the login form
3. Register with your email and password via Supabase Auth
4. The system will automatically register you as an admin

### 4. Paystack Integration
- Get your API keys from [Paystack Dashboard](https://paystack.com)
- Add keys to environment variables
- Testing: Use Paystack test keys for development

### 5. WhatsApp Integration
- WhatsApp link is pre-configured to +2347036947900
- To change: Update the WhatsApp number in checkout/page.tsx and success page

## Pages & Routes

### Customer Routes
- `/` - Home page with questionnaire
- `/products` - Product listing (filtered by questionnaire answers)
- `/products/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page (Paystack or WhatsApp)
- `/checkout/success` - Order confirmation

### Admin Routes
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Main admin dashboard (gadget management, orders)
- `/admin/gadgets/new` - Add new gadget
- `/admin/gadgets/[id]/edit` - Edit gadget

## API Routes

### Gadgets
- `GET /api/gadgets` - Fetch gadgets with filters
- `POST /api/gadgets` - Create new gadget
- `GET /api/gadgets/[id]` - Get gadget details
- `PUT /api/gadgets/[id]` - Update gadget
- `DELETE /api/gadgets/[id]` - Delete gadget

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Fetch all orders

### Payments
- `POST /api/verify-payment` - Verify Paystack payment

### Uploads
- `POST /api/upload` - Upload image to Supabase Storage

## Design & Branding

- **Logo**: NOVA GADGETS logo (saved as `/public/nova-gadgets-logo.jpg`)
- **Colors**: 
  - Primary: Blue (#2563EB)
  - Neutral: Grays and whites for accessibility
  - High contrast for readability
- **Typography**: Clean, modern sans-serif
- **Layout**: Mobile-first responsive design

## Testing the Application

### Without Products
The initial state has no products. To test:
1. Go to Admin Panel (`/admin/login`)
2. Sign up with an email
3. Add sample gadgets with different specifications
4. Return to home page and go through questionnaire
5. See filtered products based on your selections

### Sample Gadget Data
When adding gadgets, use realistic specs:
- **For CapCut**: 4GB RAM minimum
- **For Adobe/DaVinci**: 8GB-16GB RAM recommended
- **Processors**: Core i5, i7, i9 (7th gen and above)
- **Brands**: Dell, HP, Lenovo, MacBook, ASUS, etc.

## Support

For support inquiries:
- **WhatsApp**: +2347036947900
- **Email**: admin@novagadgets.com (update as needed)

## Security Notes

- All data is protected with Row Level Security (RLS) policies
- Admin authentication requires email verification
- Paystack handles payment security
- Images are stored securely in Supabase Storage
- Never expose secret API keys in client-side code

## Future Enhancements

- Product reviews and ratings
- Wishlist functionality
- Email notifications for orders
- SMS notifications via WhatsApp
- Advanced search and filters
- Product recommendations
- Customer accounts and order history
- Analytics dashboard
- Bulk gadget import

---

**NOVA GADGETS** - Premium Tech for Content Creators
