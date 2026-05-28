import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const adminClient = createAdminClient()

    // Create the auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: 'juliusokpanachi419@gmail.com',
      password: '12345678',
      email_confirm: true,
    })

    if (authError) {
      // User might already exist
      if (authError.message?.includes('already exists')) {
        return NextResponse.json(
          { message: 'Admin user already exists. Try logging in.', success: true },
          { status: 200 }
        )
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Add to admin_users table
    const { error: dbError } = await adminClient
      .from('admin_users')
      .upsert({
        id: authData.user.id,
        email: 'juliusokpanachi419@gmail.com',
        full_name: 'Super Admin',
        is_super_admin: true,
      })
      .select()

    if (dbError && !dbError.message?.includes('duplicate')) {
      console.error('Database error:', dbError)
      // Continue anyway - auth user was created
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Admin user created successfully',
        email: 'juliusokpanachi419@gmail.com',
        password: '12345678',
        instructions: 'Go to /admin/login and use these credentials',
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Admin initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize admin' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Admin initialization endpoint. Use POST to initialize admin user.',
      instructions: 'POST to this endpoint to create admin user: juliusokpanachi419@gmail.com / 12345678',
    },
    { status: 200 }
  )
}
