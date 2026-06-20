import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if orders table exists
    const { error: checkError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
          CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
          CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
          CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
        `
      })

      if (createError) {
        return NextResponse.json(
          { error: 'Failed to create orders table', details: createError },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tables initialized successfully' 
    })
  } catch (error) {
    console.error('[v0] Table init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize tables', details: String(error) },
      { status: 500 }
    )
  }
}
