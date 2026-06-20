import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('setting_key', 'paystack_config')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      success: true,
      data: data ? JSON.parse(data.setting_value || '{}') : {
        publicKey: '',
        secretKey: ''
      }
    })
  } catch (error) {
    console.error('Error fetching Paystack settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createClient()

    // Check if settings exist
    const { data: existing } = await supabase
      .from('admin_settings')
      .select('id')
      .eq('setting_key', 'paystack_config')
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('admin_settings')
        .update({
          setting_value: JSON.stringify(body),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'paystack_config')

      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          setting_key: 'paystack_config',
          setting_value: JSON.stringify(body),
          setting_type: 'payment',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    }

    // Also update environment variable for use in checkout
    process.env.NEXT_PUBLIC_PAYSTACK_KEY = body.publicKey

    return NextResponse.json({
      success: true,
      message: 'Paystack settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving Paystack settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
