import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Only admins can delete gadgets' },
        { status: 403 }
      )
    }

    // Delete product images first
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', params.id)

    if (imagesError) {
      console.error('[v0] Error deleting product images:', imagesError)
    }

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('[v0] Error deleting gadget:', error)
      return NextResponse.json(
        { error: 'Failed to delete gadget' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Gadget deleted successfully'
    })
  } catch (error: any) {
    console.error('[v0] Delete gadget error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
