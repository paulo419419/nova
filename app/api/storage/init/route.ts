import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Try to create the gadget-images bucket
    const { data, error } = await supabase.storage.createBucket('gadget-images', {
      public: true,
    })
    
    if (error && !error.message?.includes('already exists')) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Gadget images bucket is ready'
    })
  } catch (error) {
    console.error('[v0] Storage init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize storage' },
      { status: 500 }
    )
  }
}
