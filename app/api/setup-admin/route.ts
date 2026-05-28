import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Get the user ID for the admin email
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers()

    if (userError) {
      throw userError
    }

    const adminUser = userData.users.find(u => u.email === 'juliusokpanachi419@gmail.com')

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found. Call /api/init-admin first.' },
        { status: 404 }
      )
    }

    // Create or update the admin_users record
    const { data, error } = await adminClient
      .from('admin_users')
      .upsert({
        id: adminUser.id,
        email: 'juliusokpanachi419@gmail.com',
        full_name: 'Super Admin',
        is_super_admin: true,
      }, {
        onConflict: 'email'
      })
      .select()

    if (error) {
      console.error('Error creating admin record:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user setup completed',
      adminId: adminUser.id,
      email: 'juliusokpanachi419@gmail.com',
      record: data,
    })
  } catch (error: any) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Setup failed' },
      { status: 500 }
    )
  }
}
