import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('setting_key', 'email_config')
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return NextResponse.json({
      success: true,
      data: data ? JSON.parse(data.setting_value || '{}') : {
        senderEmail: 'noreply@novagadgets.com',
        senderName: 'NOVA GADGETS',
        gmailAddress: '',
        gmailAppPassword: '',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587
      }
    })
  } catch (error) {
    console.error('Error fetching email settings:', error)
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
      .eq('setting_key', 'email_config')
      .single()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('admin_settings')
        .update({
          setting_value: JSON.stringify(body),
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', 'email_config')

      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase
        .from('admin_settings')
        .insert({
          setting_key: 'email_config',
          setting_value: JSON.stringify(body),
          setting_type: 'communication',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    }

    // Store in environment for nodemailer
    process.env.GMAIL_ADDRESS = body.gmailAddress
    process.env.GMAIL_APP_PASSWORD = body.gmailAppPassword

    return NextResponse.json({
      success: true,
      message: 'Email settings saved successfully'
    })
  } catch (error) {
    console.error('Error saving email settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
