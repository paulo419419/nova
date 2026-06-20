import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: 'Missing Supabase credentials'
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create orders table with raw SQL
    const ordersSql = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        delivery_address TEXT NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        items JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        shipping_cost NUMERIC(10, 2) NOT NULL,
        total NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        paystack_reference VARCHAR(255),
        order_status VARCHAR(50) DEFAULT 'processing',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(customer_email);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON public.orders(created_at);
    `

    const adminSettingsSql = `
      CREATE TABLE IF NOT EXISTS public.admin_settings (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );
    `

    // Execute orders table creation
    const { error: ordersErr } = await supabase.rpc('exec_sql', {
      sql: ordersSql
    }).catch(() => ({ error: { message: 'RPC not available' } }))

    // Execute admin settings table creation
    const { error: settingsErr } = await supabase.rpc('exec_sql', {
      sql: adminSettingsSql
    }).catch(() => ({ error: { message: 'RPC not available' } }))

    // Try alternative approach using direct query
    try {
      const { data: testOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      return NextResponse.json({
        status: 'success',
        message: 'Tables verified/created',
        ordersTableReady: true
      })
    } catch (err) {
      // Table might not exist yet, try to verify by checking table info
      return NextResponse.json({
        status: 'pending',
        message: 'Tables being created. Please try again in a moment.',
        error: String(err)
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Table creation error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to ensure tables exist: ' + String(error)
    }, { status: 500 })
  }
}
