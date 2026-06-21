'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function OrderStatusPage() {
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'order-id'>('email')
  const [searchValue, setSearchValue] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const supabase = createClient()
      let query = supabase.from('orders').select('*')

      if (searchType === 'email') {
        query = query.eq('customer_email', searchValue.toLowerCase())
      } else if (searchType === 'phone') {
        query = query.eq('customer_phone', searchValue)
      } else {
        query = query.eq('id', searchValue)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      if (data && data.length > 0) {
        setOrder(data[0])
      } else {
        setError('No order found. Please check your details and try again.')
      }
    } catch (err) {
      console.error('Error searching order:', err)
      setError('Failed to search order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const CONTACT_NUMBERS = [
    { label: 'Main Support', number: '+234 703 694 7900' },
    { label: 'Sales Team', number: '+234 803 XXX XXXX' },
    { label: 'Technical Support', number: '+234 805 XXX XXXX' }
  ]

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Track Your Order</h1>
        <p className="text-slate-600 mb-8">Enter your order details to check the status</p>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Search Form */}
          <div className="md:col-span-2">
            <Card className="p-6 mb-6">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Search By:
                  </label>
                  <div className="flex gap-2 mb-4">
                    {[
                      { value: 'email', label: 'Email' },
                      { value: 'phone', label: 'Phone' },
                      { value: 'order-id', label: 'Order ID' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSearchType(option.value as any)
                          setSearchValue('')
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          searchType === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    {searchType === 'email' && 'Your Email Address'}
                    {searchType === 'phone' && 'Your Phone Number'}
                    {searchType === 'order-id' && 'Your Order ID'}
                  </label>
                  <input
                    type={searchType === 'email' ? 'email' : 'text'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={
                      searchType === 'email'
                        ? 'john@example.com'
                        : searchType === 'phone'
                        ? '+234 803 123 4567'
                        : 'Order ID'
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !searchValue}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Searching...' : 'Search Order'}
                </Button>
              </form>
            </Card>

            {/* Order Details */}
            {order && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Order Details</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-slate-900">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                      <p><strong>Name:</strong> {order.customer_name}</p>
                      <p><strong>Email:</strong> {order.customer_email}</p>
                      <p><strong>Phone:</strong> {order.customer_phone}</p>
                      <p><strong>State:</strong> {order.customer_state}</p>
                      <p><strong>Address:</strong> {order.customer_address}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-700">Subtotal:</span>
                        <span className="font-medium">₦{order.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700">Shipping:</span>
                        <span className="font-medium">₦{order.shipping_cost?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                        <span className="font-semibold text-slate-900">Total:</span>
                        <span className="font-bold text-blue-600">₦{order.total_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-xs text-slate-500">
                      Order Date: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Contact Numbers Sidebar */}
          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="font-semibold text-slate-900 mb-4">Need Help?</h3>
              
              <div className="space-y-3 mb-6">
                {CONTACT_NUMBERS.map((contact, idx) => (
                  <a
                    key={idx}
                    href={`https://wa.me/${contact.number.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <p className="text-xs text-slate-600 font-medium">{contact.label}</p>
                    <p className="text-sm font-semibold text-green-700">{contact.number}</p>
                  </a>
                ))}
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p className="font-semibold">Support Hours:</p>
                <p>Monday - Friday: 9AM - 6PM</p>
                <p>Saturday: 10AM - 4PM</p>
                <p>Sunday: Closed</p>
              </div>

              <Link href="/">
                <Button variant="outline" className="w-full mt-4">
                  Back to Home
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
