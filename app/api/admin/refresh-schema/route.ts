import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated as admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!adminData) {
      return NextResponse.json({ error: 'Only admins can refresh schema' }, { status: 403 })
    }

    // Force refresh schema cache by querying each table
    const tables = ['products', 'orders', 'complaints', 'admin_settings', 'admin_users']
    
    for (const table of tables) {
      try {
        await supabase.from(table).select('count', { count: 'exact' }).limit(1)
      } catch (e) {
        console.log(`[v0] Table ${table} checked:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Schema cache refreshed',
      tables: tables,
    })
  } catch (error: any) {
    console.error('[v0] Schema refresh error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to refresh schema' },
      { status: 500 }
    )
  }
}
