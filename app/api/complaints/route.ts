import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, product_id, complaint_type, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert complaint
    const { data, error } = await supabase
      .from('complaints')
      .insert({
        name,
        email,
        phone: phone || null,
        product_id: product_id || null,
        complaint_type: complaint_type || 'general',
        message,
        status: 'pending',
      })
      .select()

    if (error) {
      console.error('[v0] Error creating complaint:', error)
      return NextResponse.json(
        { error: 'Failed to submit complaint' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Complaint submitted successfully',
      data: data?.[0],
    })
  } catch (error: any) {
    console.error('[v0] Complaints API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Only admins can view complaints' },
        { status: 403 }
      )
    }

    // Get all complaints
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Error fetching complaints:', error)
      return NextResponse.json(
        { error: 'Failed to fetch complaints' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: complaints || [],
    })
  } catch (error: any) {
    console.error('[v0] GET complaints error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
