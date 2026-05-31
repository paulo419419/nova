'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Gadget {
  id: string
  name: string
}

const COMPLAINT_TYPES = [
  'Product Quality',
  'Shipping Issue',
  'Damaged Product',
  'Wrong Item',
  'Service Issue',
  'Other',
]

export default function ComplaintPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    product_id: '',
    complaint_type: 'general',
    message: '',
  })
  const [gadgets, setGadgets] = useState<Gadget[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGadgets()
  }, [])

  const fetchGadgets = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name')
        .order('name')

      setGadgets(data || [])
    } catch (error) {
      console.error('Error fetching gadgets:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit complaint')
        return
      }

      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        product_id: '',
        complaint_type: 'general',
        message: '',
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Log a Complaint</h1>
          <p className="text-slate-600">
            Help us improve by sharing your feedback or reporting any issues with our products or services.
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <Card className="mb-6 p-4 bg-green-50 border-green-200">
            <p className="text-green-700 font-medium">
              ✓ Your complaint has been submitted successfully. Our team will review it shortly.
            </p>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 p-4 bg-red-50 border-red-200">
            <p className="text-red-700 font-medium">✗ {error}</p>
          </Card>
        )}

        {/* Form */}
        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+234 (optional)"
              />
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Related Product (if applicable)
              </label>
              <select
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a product...</option>
                {gadgets.map((gadget) => (
                  <option key={gadget.id} value={gadget.id}>
                    {gadget.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Complaint Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Complaint Type
              </label>
              <select
                name="complaint_type"
                value={formData.complaint_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {COMPLAINT_TYPES.map((type) => (
                  <option key={type} value={type.toLowerCase().replace(/\s+/g, '_')}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe your complaint in detail..."
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
