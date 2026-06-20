'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = parseFloat(String(item.price || 0))
    const itemQty = parseInt(String(item.quantity || 1))
    return sum + (itemPrice * itemQty)
  }, 0)
  const shippingBase = 1500 // Base shipping fee ₦1,500
  const shippingPerItem = 500 // Additional ₦500 per item
  const shippingCost = shippingBase + (cart.length * shippingPerItem)
  const total = Math.max(0, subtotal + shippingCost)

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
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
          <Link href="/products">
            <Button variant="outline" size="sm">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-600 mb-6">
              Browse our collection of gadgets and add items to your cart
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Shopping
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="p-4 flex gap-4">
                  {/* Image */}
                  {item.image_url && (
                    <div className="w-24 h-24 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 block mb-1"
                      >
                        {item.name}
                      </Link>
                      {item.compatibleSoftware && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {(Array.isArray(item.compatibleSoftware)
                            ? item.compatibleSoftware
                            : typeof item.compatibleSoftware === 'string'
                            ? item.compatibleSoftware.split(',').map((s) => s.trim())
                            : []
                          ).map((software) => (
                            <span
                              key={software}
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                            >
                              {software}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xl font-bold text-blue-600">
                        ₦{item.price.toLocaleString()}
                      </div>
                    </div>

                    {/* Quantity and Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-slate-300 rounded-lg">
                        <button
                          onClick={() =>
                            updateCartQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 font-medium text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 sticky top-20">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping</span>
                    <span>₦{shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    ({shippingBase.toLocaleString()} base + ₦{shippingPerItem} per item)
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-slate-900 text-lg">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <Link href="/checkout" className="block w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mb-3">
                    Proceed to Checkout
                  </Button>
                </Link>

                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                >
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>

                {/* Support */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-700">
                    <span className="font-semibold">Need help?</span>
                    <br />
                    WhatsApp: <a
                      href="https://wa.me/2347036947900"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      +234 703 694 7900
                    </a>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
