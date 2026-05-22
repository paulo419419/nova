import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - not logged in' },
        { status: 401 }
      )
    }

    // Check if current user is admin
    const adminClient = createAdminClient()
    const { data: adminCheck, error: adminCheckError } = await adminClient
      .from('admin_users')
      .select('id')
      .eq('email', user.email)
      .single()

    if (adminCheckError || !adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - not an admin' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    const { newAdminEmail, newAdminPassword } = body

    if (!newAdminEmail || !newAdminPassword) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create new admin user using admin API with service role key
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: newAdminEmail,
      password: newAdminPassword,
      email_confirm: true, // Auto-confirm email
    })

    if (createError || !newUser) {
      return NextResponse.json(
        { error: createError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    // Add to admin_users table
    const { error: dbError } = await adminClient
      .from('admin_users')
      .insert([
        {
          id: newUser.user.id,
          email: newUser.user.email,
        },
      ])

    if (dbError) {
      // Delete the created user if we can't add to admin table
      await adminClient.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json(
        { error: 'Failed to add admin to database' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Admin created successfully',
        admin: { id: newUser.user.id, email: newUser.user.email }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
