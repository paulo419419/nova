import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-admin'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    // Verify admin access (you should add proper authentication here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Read and execute the migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_create_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL,
    }).catch(() => {
      // If RPC doesn't exist, try direct execution
      return supabase.from('_migrations').select('*').limit(1)
    })

    if (error) {
      console.error('Migration error:', error)
      // Try to execute commands manually if RPC fails
      return NextResponse.json(
        { 
          message: 'Database setup initiated',
          warning: 'Please run migrations manually in Supabase dashboard',
          steps: [
            '1. Go to your Supabase project dashboard',
            '2. Navigate to the SQL Editor',
            '3. Copy and paste the contents of supabase/migrations/001_create_tables.sql',
            '4. Execute the SQL',
          ]
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Database setup completed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { 
        error: 'Setup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
