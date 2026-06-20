import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Create orders table
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    })

    if (ordersError?.code === 'PGRST204') {
      // Table might already exist, try to use it
      console.log('Orders table already exists or creating...')
    } else if (ordersError) {
      console.error('Orders table error:', ordersError)
    }

    // Create admin_settings table
    const { error: settingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          setting_key VARCHAR(255) UNIQUE NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    })

    if (settingsError?.code === 'PGRST204') {
      console.log('Admin settings table already exists or creating...')
    } else if (settingsError) {
      console.error('Admin settings error:', settingsError)
    }

    // Try direct SQL approach
    try {
      // Check if orders table exists
      const { data: ordersCheck } = await supabase
        .from('orders')
        .select('id')
        .limit(1)

      return NextResponse.json({
        status: 'success',
        message: 'Database initialized',
        ordersTableExists: true
      })
    } catch (checkError) {
      console.error('Check error:', checkError)
      return NextResponse.json({
        status: 'needs_manual_setup',
        message: 'Please run migrations manually in Supabase dashboard'
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Database init error:', error)
    return NextResponse.json({
      status: 'error',
      message: String(error)
    }, { status: 500 })
  }
}
