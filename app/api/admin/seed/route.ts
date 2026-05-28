import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'

/**
 * This endpoint creates the first admin user.
 * It should only be called once during setup.
 * For security, it can be disabled after use.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the seed data from request body
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists with this email' },
        { status: 400 }
      )
    }

    // Create the auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError || !newUser) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create admin user' },
        { status: 400 }
      )
    }

    // Add to admin_users table as super admin (first admin)
    const { error: dbError } = await adminClient
      .from('admin_users')
      .insert([
        {
          id: newUser.user.id,
          email: newUser.user.email,
          is_super_admin: true,
        },
      ])

    if (dbError) {
      // Delete the created user if we can't add to admin table
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Failed to add admin to database: ' + dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Admin user created successfully',
        admin: { 
          id: newUser.user.id, 
          email: newUser.user.email,
          is_super_admin: true
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error seeding admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
