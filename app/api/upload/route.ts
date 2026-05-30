import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[v0] Uploading file to Vercel Blob:', file.name, 'Size:', file.size, 'Type:', file.type)

    // Upload to Vercel Blob with public access and unique filename
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    console.log('[v0] File uploaded successfully to Blob:', blob.url)

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
    })
  } catch (error) {
    console.error('[v0] Blob upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
