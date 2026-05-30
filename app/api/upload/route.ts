import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Create a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${file.name.split('.').pop()}`
    const buffer = await file.arrayBuffer()

    let uploadError = null
    let uploadData = null

    // Try to upload to existing bucket
    const uploadResult = await supabase.storage
      .from('gadget-images')
      .upload(filename, buffer, {
        contentType: file.type,
      })

    uploadError = uploadResult.error
    uploadData = uploadResult.data

    // If bucket doesn't exist, create it first
    if (uploadError && uploadError.message?.includes('Bucket not found')) {
      try {
        const { data: bucketData, error: bucketError } = await adminClient.storage.createBucket('gadget-images', {
          public: true,
        })
        
        if (!bucketError || bucketError.message?.includes('already exists')) {
          // Try upload again
          const retryResult = await supabase.storage
            .from('gadget-images')
            .upload(filename, buffer, {
              contentType: file.type,
            })
          
          uploadError = retryResult.error
          uploadData = retryResult.data
        }
      } catch (bucketCreateError) {
        console.error('[v0] Error creating bucket:', bucketCreateError)
      }
    }

    if (uploadError) {
      console.error('[v0] Upload error:', uploadError)
      return NextResponse.json({ error: uploadError.message || 'Upload failed' }, { status: 500 })
    }

    // Get the public URL
    const { data: publicData } = supabase.storage
      .from('gadget-images')
      .getPublicUrl(filename)

    return NextResponse.json({
      url: publicData.publicUrl,
      path: uploadData?.path,
    })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
