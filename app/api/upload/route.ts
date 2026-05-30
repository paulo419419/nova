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
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
    const buffer = await file.arrayBuffer()

    console.log('[v0] Uploading file:', filename, 'Size:', buffer.byteLength, 'Type:', file.type)

    // Upload directly to gadget-images bucket
    const { data, error } = await supabase.storage
      .from('gadget-images')
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (error) {
      console.error('[v0] Storage upload error:', error)
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 500 }
      )
    }

    console.log('[v0] File uploaded successfully:', data)

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from('gadget-images')
      .getPublicUrl(filename)

    console.log('[v0] Public URL generated:', publicData.publicUrl)

    return NextResponse.json({
      url: publicData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('[v0] Upload endpoint error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
