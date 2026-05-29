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

    // Check if current user is authorized to create admins
    const authorizedEmails = [
      'juliusokpanachi419@gmail.com',
      'novacreations111@gmail.com'
    ]

    const adminClient = createAdminClient()
    let isAuthorized = authorizedEmails.includes(user.email || '')

    // If not in authorized list, check admin_users table for super admin
    if (!isAuthorized) {
      const { data: adminCheck, error: adminCheckError } = await adminClient
        .from('admin_users')
        .select('id, is_super_admin')
        .eq('email', user.email)
        .single()

      if (!adminCheckError && adminCheck && adminCheck.is_super_admin) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden - only authorized admins can create new admin accounts' },
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
      email_confirm: false,
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
