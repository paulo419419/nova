'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  compatible_software: string[]
  price_category: string
  is_in_stock: boolean
}

export default function ProductsPage() {
  const { questionnaire, addToCart } = useStore()
  const [gadgets, setGadgets] = useState<Gadget[]>([])
  const [filteredGadgets, setFilteredGadgets] = useState<Gadget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchGadgets = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('gadgets')
          .select('*')
          .eq('is_in_stock', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setGadgets(data || [])
      } catch (error) {
        console.error('Error fetching gadgets:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGadgets()
  }, [])

  // Filter gadgets based on questionnaire and selected category
  useEffect(() => {
    let filtered = [...gadgets]

    // Filter by price category
    if (questionnaire.budget) {
      filtered = filtered.filter((g) => g.price_category === questionnaire.budget)
    }

    // Filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter((g) => g.price_category === selectedCategory)
    }

    // Filter by software compatibility
    if (questionnaire.softwareChoice) {
      const softwareMap: Record<string, string> = {
        capcut: 'CapCut',
        adobe_premiere: 'Adobe Premiere',
        davinci_resolve: 'DaVinci Resolve',
      }
      const softwareName = softwareMap[questionnaire.softwareChoice]
      filtered = filtered.filter((g) =>
        g.compatible_software?.some((s) =>
          s.toLowerCase().includes(softwareName.toLowerCase())
        )
      )
    }

    setFilteredGadgets(filtered)
  }, [gadgets, questionnaire, selectedCategory])

  const categories = [
    { value: '100k', label: '₦100,000' },
    { value: '200k', label: '₦200,000' },
    { value: '300k', label: '₦300,000' },
    { value: 'above', label: 'Above ₦300,000' },
  ]

  const handleAddToCart = (gadget: Gadget) => {
    addToCart({
      id: gadget.id,
      name: gadget.name,
      price: gadget.price,
      quantity: 1,
      image_url: gadget.image_url,
      compatibleSoftware: gadget.compatible_software,
    })
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
          <div className="flex items-center gap-3">
            <Link href="/cart">
              <Button variant="outline" size="sm">
                Cart
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {/* Filters Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Filter by Price Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.value ? null : cat.value
                  )
                }
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {questionnaire.answered && (
            <p className="text-sm text-slate-600 mt-3">
              Showing devices with{' '}
              <strong>{questionnaire.softwareChoice}</strong> support
            </p>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredGadgets.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No devices found
            </h3>
            <p className="text-slate-600 mb-4">
              Try adjusting your filters or browse all categories
            </p>
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="outline"
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredGadgets.map((gadget) => (
              <Card
                key={gadget.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Image */}
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  {gadget.image_url ? (
                    <Image
                      src={gadget.image_url}
                      alt={gadget.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">
                      {gadget.name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {gadget.brand} • {gadget.processor}{' '}
                      {gadget.processor_generation}
                    </p>
                  </div>

                  {/* Specs */}
                  <div className="bg-slate-50 p-3 rounded-lg mb-3 text-xs text-slate-700">
                    <div>RAM: {gadget.ram_gb}GB</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {gadget.compatible_software?.map((software) => (
                        <span
                          key={software}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {software}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-auto">
                    <div className="text-2xl font-bold text-blue-600 mb-3">
                      ₦{gadget.price.toLocaleString()}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <Link href={`/products/${gadget.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(gadget)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
