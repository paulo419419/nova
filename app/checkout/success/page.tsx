'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order')
  const method = searchParams.get('method')

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-slate-900">NOVA GADGETS</span>
          </Link>
        </div>
      </header>

      {/* Success Message */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <Card className="w-full max-w-md p-8 text-center shadow-lg">
          {/* Success Icon */}
          <div className="text-6xl mb-4">✓</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Order Confirmed!
          </h1>

          {/* Message */}
          <p className="text-slate-700 mb-6">
            {method === 'whatsapp'
              ? 'Your order has been created. Our sales team will contact you via WhatsApp shortly to confirm payment details.'
              : 'Thank you for your purchase! Your order has been confirmed.'}
          </p>

          {/* Order Details */}
          <div className="bg-slate-50 p-4 rounded-lg mb-6 text-left">
            <div className="mb-3">
              <p className="text-xs text-slate-600 uppercase tracking-wider">
                Order ID
              </p>
              <p className="font-mono font-bold text-slate-900">
                {orderId || 'Processing...'}
              </p>
            </div>

            {method === 'whatsapp' && (
              <div>
                <p className="text-xs text-slate-600 uppercase tracking-wider mb-2">
                  Next Steps
                </p>
                <ol className="text-sm text-slate-700 space-y-2">
                  <li>1. Watch for a WhatsApp message from our sales team</li>
                  <li>2. Confirm your order and payment method</li>
                  <li>3. Complete payment according to instructions</li>
                  <li>4. Receive shipping confirmation</li>
                </ol>
              </div>
            )}
          </div>

          {/* Support Section */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Need help?</span>
              <br />
              Contact us on WhatsApp for order updates and support:
              <br />
              <a
                href="https://wa.me/2347036947900"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold block mt-2"
              >
                +234 703 694 7900
              </a>
            </p>
          </div>

          {/* Email Confirmation Note */}
          <p className="text-xs text-slate-600 mb-6">
            A confirmation email has been sent to your email address with order details.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/products" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Security Badge */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
