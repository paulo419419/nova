import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json(
        { error: 'Missing payment reference' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    const paymentData = data.data

    // Update order status in database
    const supabase = await createClient()

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentData.status === 'success' ? 'completed' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('paystack_reference', reference)
      .select()
      .single()

    if (orderError) {
      console.error('Order update error:', orderError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: paymentData.status === 'success',
      message:
        paymentData.status === 'success'
          ? 'Payment verified successfully'
          : 'Payment failed',
      orderId: orderData?.id,
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
