import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify admin is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { testEmail } = body

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Test email address is required' },
        { status: 400 }
      )
    }

    // Fetch Gmail settings from database
    const { data: emailSettings } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('setting_key', 'gmail_config')
      .single()

    const emailConfig = emailSettings ? JSON.parse(emailSettings.setting_value || '{}') : {
      address: process.env.GMAIL_ADDRESS,
      password: process.env.GMAIL_APP_PASSWORD,
    }

    // Validate that email is configured
    if (!emailConfig.address || !emailConfig.password) {
      return NextResponse.json(
        { 
          error: 'Gmail not configured', 
          details: 'Admin must configure Gmail in Settings first'
        },
        { status: 500 }
      )
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailConfig.address,
        pass: emailConfig.password,
      },
    })

    // Send test email
    const result = await transporter.sendMail({
      from: `NOVA GADGETS <${emailConfig.address}>`,
      to: testEmail,
      subject: 'NOVA GADGETS - Email Configuration Test',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc; }
              .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 20px; }
              .success { background: #dcfce7; border: 1px solid #86efac; padding: 15px; border-radius: 8px; color: #166534; }
              .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Email Configuration Test</h1>
              </div>
              <div class="content">
                <div class="success">
                  <h2 style="margin-top: 0; color: #16a34a;">✓ Email is Working!</h2>
                  <p>This is a test email from NOVA GADGETS.</p>
                  <p>Your Gmail configuration is set up correctly and order confirmation emails will be sent automatically.</p>
                </div>
                
                <h3>Configuration Details:</h3>
                <ul>
                  <li>From: NOVA GADGETS</li>
                  <li>Email: ${emailConfig.address}</li>
                  <li>Status: Active</li>
                </ul>

                <p>Customers will receive confirmation emails like this after placing orders.</p>

                <p><strong>Next steps:</strong></p>
                <ol>
                  <li>Check your spam folder if you don't see the test email</li>
                  <li>Whitelist "NOVA GADGETS" in your email client</li>
                  <li>Place a test order to verify the confirmation email flow</li>
                </ol>
              </div>
              <div class="footer">
                <p>© 2026 NOVA GADGETS. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: 'Email Configuration Test - Your Gmail is working correctly!'
    })

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent successfully to ${testEmail}`,
      messageId: result.messageId,
      from: emailConfig.address
    })
  } catch (error: any) {
    console.error('[v0] Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send test email', 
        details: error.message || String(error)
      },
      { status: 500 }
    )
  }
}
