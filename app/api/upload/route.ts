import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BUCKET_NAME = 'gadget-images'

async function ensureBucketExists(supabase: any) {
  try {
    // Try to list objects in the bucket to check if it exists
    const { error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 })

    // If bucket exists, return true
    if (!listError) {
      return true
    }

    console.log('[v0] Bucket does not exist, attempting to create...')

    // Create the bucket using direct API call
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase credentials')
    }

    const response = await fetch(`${SUPABASE_URL}/storage/v1/buckets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        name: BUCKET_NAME,
        public: true,
      }),
    })

    if (!response.ok && response.status !== 409) {
      const error = await response.json()
      throw new Error(`Failed to create bucket: ${error.message || response.statusText}`)
    }

    console.log('[v0] Bucket created or already exists')
    return true
  } catch (error) {
    console.error('[v0] Error ensuring bucket exists:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()

    // Ensure bucket exists before uploading
    const bucketReady = await ensureBucketExists(supabase)
    if (!bucketReady) {
      return NextResponse.json(
        { error: 'Failed to initialize storage bucket' },
        { status: 500 }
      )
    }

    // Create a unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`
    const buffer = await file.arrayBuffer()

    console.log('[v0] Uploading file:', filename, 'Size:', buffer.byteLength, 'Type:', file.type)

    // Upload to gadget-images bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
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
      .from(BUCKET_NAME)
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
