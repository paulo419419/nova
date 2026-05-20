import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'laptop'
    const priceCategory = searchParams.get('priceCategory')
    const software = searchParams.get('software')
    const minRam = searchParams.get('minRam')

    let query = supabase
      .from('gadgets')
      .select('*')
      .eq('category', category)
      .eq('is_in_stock', true)
      .order('created_at', { ascending: false })

    if (priceCategory) {
      query = query.eq('price_category', priceCategory)
    }

    if (minRam) {
      query = query.gte('ram_gb', parseInt(minRam))
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by software if specified
    let filtered = data || []
    if (software) {
      filtered = filtered.filter((gadget) =>
        gadget.compatible_software?.includes(software)
      )
    }

    return NextResponse.json(filtered)
  } catch (error) {
    console.error('Fetch gadgets error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('gadgets')
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create gadget error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
