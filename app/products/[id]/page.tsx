'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Gadget {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  brand: string
  processor: string
  processor_generation: string
  ram_gb: number
  storage_gb?: number
  screen_size?: number
  graphics?: string
  compatible_software: string[]
  price_category: string
  is_in_stock: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart, cart } = useStore()
  const [gadget, setGadget] = useState<Gadget | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    const fetchGadget = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error
        setGadget(data)
      } catch (error) {
        console.error('Error fetching gadget:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchGadget()
    }
  }, [params.id])

  const handleAddToCart = () => {
    if (gadget) {
      addToCart({
        id: gadget.id,
        name: gadget.name,
        price: gadget.price,
        quantity,
        image_url: gadget.image_url,
        compatibleSoftware: gadget.compatible_software,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!gadget) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Product not found
          </h1>
          <p className="text-slate-600 mb-4">
            The device you are looking for could not be found.
          </p>
          <Link href="/products">
            <Button>Back to Products</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 py-4 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/products" className="flex items-center gap-2">
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
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/products">
          <Button variant="outline" size="sm" className="mb-6">
            ← Back to Products
          </Button>
        </Link>

        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8">
            {/* Image */}
            <div className="relative h-96 bg-slate-200 rounded-lg overflow-hidden">
              {gadget.image_url ? (
                <Image
                  src={gadget.image_url}
                  alt={gadget.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No image available
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {gadget.name}
              </h1>
              <p className="text-slate-600 mb-4">
                {gadget.brand} • {gadget.processor} {gadget.processor_generation}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600">
                  ₦{gadget.price.toLocaleString()}
                </div>
                {gadget.is_in_stock ? (
                  <div className="text-green-600 font-medium mt-2">
                    ✓ In Stock
                  </div>
                ) : (
                  <div className="text-red-600 font-medium mt-2">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Software Support */}
              {gadget.compatible_software && gadget.compatible_software.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Compatible Software
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(gadget.compatible_software)
                      ? gadget.compatible_software
                      : typeof gadget.compatible_software === 'string'
                      ? gadget.compatible_software.split(',').map((s) => s.trim())
                      : []
                    ).map((software) => (
                      <span
                        key={software}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {software}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-100 p-3 rounded">
                    <div className="text-slate-600">RAM</div>
                    <div className="font-semibold text-slate-900">
                      {gadget.ram_gb}GB
                    </div>
                  </div>
                  {gadget.storage_gb && (
                    <div className="bg-slate-100 p-3 rounded">
                      <div className="text-slate-600">Storage</div>
                      <div className="font-semibold text-slate-900">
                        {gadget.storage_gb}GB
                      </div>
                    </div>
                  )}
                  {gadget.screen_size && (
                    <div className="bg-slate-100 p-3 rounded">
                      <div className="text-slate-600">Screen</div>
                      <div className="font-semibold text-slate-900">
                        {gadget.screen_size}&quot;
                      </div>
                    </div>
                  )}
                  {gadget.graphics && (
                    <div className="bg-slate-100 p-3 rounded">
                      <div className="text-slate-600">Graphics</div>
                      <div className="font-semibold text-slate-900">
                        {gadget.graphics}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {gadget.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Description
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {gadget.description}
                  </p>
                </div>
              )}

              {/* Quantity and Add to Cart */}
              <div className="mt-auto pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-700 font-medium">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg">
                    <button
                      onClick={() =>
                        setQuantity(Math.max(1, quantity - 1))
                      }
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 font-medium text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-slate-600 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={!gadget.is_in_stock}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition-all"
                >
                  {addedToCart
                    ? '✓ Added to Cart'
                    : 'Add to Cart'}
                </Button>

                {addedToCart && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm font-medium text-center">
                      ✓ Product added! ({cartCount} {cartCount === 1 ? 'item' : 'items'} in cart)
                    </p>
                  </div>
                )}

                {addedToCart && (
                  <Link href="/cart" className="w-full mt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      View Cart
                    </Button>
                  </Link>
                )}
              </div>

              {/* Support */}
              <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Need help?</span> Contact us on
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
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
