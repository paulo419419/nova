import { createAdminClient } from '@/lib/supabase/server-admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const adminClient = createAdminClient()

    // Create admin_users table using raw SQL
    const { error: tableError } = await adminClient.from('admin_users').select('count').limit(1)

    // If table doesn't exist, we need to create it
    if (tableError?.message?.includes('relation') || tableError?.message?.includes('does not exist')) {
      console.log('Table does not exist, attempting to create via auth...')
      
      // Create the table by attempting to insert data (this will fail but helps us understand the structure)
      // Instead, we'll use the PostgreSQL function approach
      
      // Since we can't execute raw SQL directly, we'll create the table schema differently
      // by using Supabase Auth's built-in admin_users table pattern
      
      return NextResponse.json({
        error: 'admin_users table does not exist in Supabase',
        instructions: 'Please follow these steps:',
        steps: [
          '1. Go to Supabase Dashboard',
          '2. Open SQL Editor',
          '3. Run the following SQL:',
          `CREATE TABLE IF NOT EXISTS public.admin_users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email VARCHAR(255) NOT NULL UNIQUE,
            full_name VARCHAR(255),
            is_super_admin BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX idx_admin_users_email ON public.admin_users(email);`,
          '4. After table is created, call /api/setup-admin to create the admin user record'
        ]
      }, { status: 400 })
    }

    return NextResponse.json({
      message: 'admin_users table exists',
      status: 'ready'
    })
  } catch (error: any) {
    console.error('Check error:', error)
    return NextResponse.json(
      { error: error.message || 'Check failed' },
      { status: 500 }
    )
  }
}
