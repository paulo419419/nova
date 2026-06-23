import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create service role client for admin operations
function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: Request) {
  try {
    // Use regular client to verify auth
    const supabase = await createServerClient()

    // Verify admin is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { setting_key, setting_value, description } = body

    if (!setting_key || !setting_value) {
      return NextResponse.json(
        { error: 'Missing required fields: setting_key and setting_value' },
        { status: 400 }
      )
    }

    // Use service role client for database operations (bypasses RLS)
    const serviceRoleClient = createServiceRoleClient()

    // Check if record exists
    const { data: existingData, error: checkError } = await serviceRoleClient
      .from('admin_settings')
      .select('id')
      .eq('setting_key', setting_key)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is expected for new settings
      console.error('Error checking if setting exists:', checkError)
    }

    let result
    let error

    if (existingData) {
      // Update if exists
      const { data, error: updateError } = await serviceRoleClient
        .from('admin_settings')
        .update({
          setting_value,
          description: description || null,
          updated_at: new Date().toISOString(),
          updated_by: user.id,
        })
        .eq('setting_key', setting_key)
        .select()

      result = data
      error = updateError
    } else {
      // Insert if doesn't exist
      const { data, error: insertError } = await serviceRoleClient
        .from('admin_settings')
        .insert({
          setting_key,
          setting_value,
          description: description || null,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()

      result = data
      error = insertError
    }

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: `Failed to save settings: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Setting saved successfully',
      data: result,
    })
  } catch (err: any) {
    console.error('Error in settings API:', err)
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Use regular client to verify auth
    const supabase = await createServerClient()

    // Verify admin is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const setting_key = searchParams.get('key')

    // Use service role client for reading (bypasses RLS)
    const serviceRoleClient = createServiceRoleClient()
    let query = serviceRoleClient.from('admin_settings').select('*')

    if (setting_key) {
      query = query.eq('setting_key', setting_key)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err: any) {
    console.error('Error fetching settings:', err)
    return NextResponse.json(
      { error: `Server error: ${err.message}` },
      { status: 500 }
    )
  }
}
