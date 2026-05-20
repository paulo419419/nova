'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, questionnaire, clearCart } = useStore()
  const [mounted, setMounted] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'whatsapp' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    setMounted(true)

    // Load Paystack script
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Cart is empty
          </h1>
          <p className="text-slate-600 mb-4">
            Please add items to your cart before checking out.
          </p>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.075
  const total = subtotal + tax

  const handlePaystackPayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all customer details')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create order first
      const supabase = createClient()
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            gadget_id: cart[0].id, // For multi-item carts, you'd need to handle this differently
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
            total_price: total,
            payment_method: 'paystack',
            payment_status: 'pending',
            questionnaire_data: questionnaire,
          },
        ])
        .select()

      if (orderError) throw orderError

      // Initialize Paystack payment
      if (window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: process.env.NEXT_PUBLIC_PAYSTACK_KEY || '',
          email: formData.email,
          amount: Math.round(total * 100), // Convert to kobo
          ref: `NOVA-${Date.now()}`,
          onClose: () => {
            setLoading(false)
            setError('Payment cancelled')
          },
          onSuccess: async (response: any) => {
            try {
              // Update order payment status
              const { error: updateError } = await supabase
                .from('orders')
                .update({
                  payment_status: 'completed',
                  paystack_reference: response.reference,
                })
                .eq('id', orderData[0].id)

              if (updateError) throw updateError

              // Redirect to success page
              clearCart()
              router.push(`/checkout/success?order=${orderData[0].id}`)
            } catch (err) {
              console.error('Error updating order:', err)
              setError('Payment confirmed but failed to process order. Please contact support.')
            } finally {
              setLoading(false)
            }
          },
        })
        handler.openIframe()
      } else {
        throw new Error('Paystack not loaded')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment')
      setLoading(false)
    }
  }

  const handleWhatsAppPayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all customer details')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Create pending order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            gadget_id: cart[0].id,
            customer_name: formData.name,
            customer_email: formData.email,
            customer_phone: formData.phone,
            quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
            total_price: total,
            payment_method: 'whatsapp',
            payment_status: 'pending',
            questionnaire_data: questionnaire,
          },
        ])
        .select()

      if (orderError) throw orderError

      // Redirect to WhatsApp
      const message = `Hi, I would like to purchase the following items:
${cart.map((item) => `- ${item.name} x${item.quantity}: ₦${(item.price * item.quantity).toLocaleString()}`).join('\n')}

Total: ₦${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}

Order ID: ${orderData[0].id}
Customer: ${formData.name}
Phone: ${formData.phone}`

      const whatsappUrl = `https://wa.me/2347036947900?text=${encodeURIComponent(message)}`
      
      clearCart()
      window.open(whatsappUrl, '_blank')
      router.push(`/checkout/success?order=${orderData[0].id}&method=whatsapp`)
    } catch (err: any) {
      setError(err.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-slate-900 hidden sm:inline">
              NOVA GADGETS
            </span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Delivery Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+234 803 XXX XXXX"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method Selection */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Payment Method
              </h2>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-3 mb-6">
                {/* Paystack Option */}
                <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400"
                  style={{
                    borderColor: paymentMethod === 'paystack' ? 'rgb(37, 99, 235)' : 'rgb(226, 232, 240)',
                    backgroundColor: paymentMethod === 'paystack' ? 'rgb(239, 246, 255)' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name="payment"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={() => setPaymentMethod('paystack')}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Paystack</div>
                    <p className="text-sm text-slate-600">
                      Secure online payment with your card
                    </p>
                  </div>
                </label>

                {/* WhatsApp Option */}
                <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-green-400"
                  style={{
                    borderColor: paymentMethod === 'whatsapp' ? 'rgb(34, 197, 94)' : 'rgb(226, 232, 240)',
                    backgroundColor: paymentMethod === 'whatsapp' ? 'rgb(240, 253, 244)' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp"
                    checked={paymentMethod === 'whatsapp'}
                    onChange={() => setPaymentMethod('whatsapp')}
                    className="w-4 h-4 mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">Pay Direct to Vendor</div>
                    <p className="text-sm text-slate-600">
                      Contact our sales team via WhatsApp to arrange payment
                    </p>
                  </div>
                </label>
              </div>

              {/* Payment Button */}
              <Button
                onClick={() =>
                  paymentMethod === 'paystack'
                    ? handlePaystackPayment()
                    : handleWhatsAppPayment()
                }
                disabled={!paymentMethod || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                {loading
                  ? 'Processing...'
                  : paymentMethod === 'paystack'
                  ? 'Pay with Paystack'
                  : 'Continue to WhatsApp'}
              </Button>

              <Link href="/cart" className="block mt-3">
                <Button variant="outline" className="w-full">
                  Back to Cart
                </Button>
              </Link>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-slate-200 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm text-slate-700"
                  >
                    <div>
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-600">x{item.quantity}</div>
                    </div>
                    <div className="font-medium text-slate-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tax (7.5%)</span>
                  <span>₦{tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Support */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">Questions?</span>
                  <br />
                  WhatsApp: <a
                    href="https://wa.me/2347036947900"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    +234 703 694 7900
                  </a>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
