import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()

    // Create a unique filename
    const filename = `${Date.now()}-${file.name}`
    const buffer = await file.arrayBuffer()

    const { data, error } = await supabase.storage
      .from('gadget-images')
      .upload(filename, buffer, {
        contentType: file.type,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from('gadget-images')
      .getPublicUrl(filename)

    return NextResponse.json({
      url: publicData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
