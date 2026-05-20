'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI']
const PROCESSORS = ['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'M1', 'M2', 'M3']
const GENERATIONS = ['7th Gen', '8th Gen', '10th Gen', '11th Gen', '12th Gen', '13th Gen']
const SOFTWARE = ['Adobe Premiere', 'DaVinci Resolve', 'CapCut']
const PRICE_CATEGORIES = ['100k', '200k', '300k', 'above']

export default function EditGadgetPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    processor: '',
    processor_generation: '',
    ram_gb: '8',
    storage_gb: '256',
    screen_size: '15.6',
    graphics: '',
    compatible_software: [] as string[],
    price_category: '200k',
    is_in_stock: true,
    image_url: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (!authUser) {
          router.push('/admin/login')
          return
        }

        setUser(authUser)
        
        // Fetch gadget
        const { data, error: fetchError } = await supabase
          .from('gadgets')
          .select('*')
          .eq('id', params.id)
          .single()

        if (fetchError) throw fetchError

        if (data) {
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            brand: data.brand || '',
            processor: data.processor || '',
            processor_generation: data.processor_generation || '',
            ram_gb: data.ram_gb?.toString() || '8',
            storage_gb: data.storage_gb?.toString() || '256',
            screen_size: data.screen_size?.toString() || '15.6',
            graphics: data.graphics || '',
            compatible_software: data.compatible_software || [],
            price_category: data.price_category || '200k',
            is_in_stock: data.is_in_stock || true,
            image_url: data.image_url || '',
          })
          if (data.image_url) {
            setImagePreview(data.image_url)
          }
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/admin/login')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router, params.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url

    try {
      setUploadingImage(true)
      const supabase = createClient()
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const { data, error } = await supabase.storage
        .from('gadget-images')
        .upload(`public/${fileName}`, imageFile)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from('gadget-images').getPublicUrl(`public/${fileName}`)

      return publicUrl
    } catch (err) {
      console.error('Image upload error:', err)
      setError('Failed to upload image')
      return formData.image_url
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSoftwareToggle = (software: string) => {
    setFormData((prev) => ({
      ...prev,
      compatible_software: prev.compatible_software.includes(software)
        ? prev.compatible_software.filter((s) => s !== software)
        : [...prev.compatible_software, software],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Upload image if provided
      let imageUrl = formData.image_url
      if (imageFile) {
        const url = await uploadImage()
        if (!url) {
          setLoading(false)
          return
        }
        imageUrl = url
      }

      // Update database
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('gadgets')
        .update({
          ...formData,
          price: parseFloat(formData.price),
          ram_gb: parseInt(formData.ram_gb),
          storage_gb: formData.storage_gb ? parseInt(formData.storage_gb) : null,
          screen_size: formData.screen_size ? parseFloat(formData.screen_size) : null,
          image_url: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (dbError) throw dbError

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to update gadget')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this gadget?')) return

    try {
      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase
        .from('gadgets')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete gadget')
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 md:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-slate-900">Admin</span>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-6 md:p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Edit Gadget
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Product Image
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="relative h-64 w-full mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-slate-600 mb-4">
                    <div className="text-4xl mb-2">📷</div>
                    <p>Drag and drop or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block cursor-pointer"
                >
                  <Button type="button" variant="outline">
                    Change Image
                  </Button>
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, price: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Category */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Price Category *
              </label>
              <select
                value={formData.price_category}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    price_category: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'above' ? 'Above ₦300,000' : `₦${cat.replace('k', ',000')}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Hardware Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, brand: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a brand</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Processor *
                </label>
                <select
                  value={formData.processor}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, processor: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select processor</option>
                  {PROCESSORS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Processor Generation *
                </label>
                <select
                  value={formData.processor_generation}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      processor_generation: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select generation</option>
                  {GENERATIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  RAM (GB) *
                </label>
                <select
                  value={formData.ram_gb}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, ram_gb: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="4">4GB</option>
                  <option value="8">8GB</option>
                  <option value="16">16GB</option>
                  <option value="32">32GB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Storage (GB)
                </label>
                <input
                  type="number"
                  value={formData.storage_gb}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      storage_gb: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Screen Size (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.screen_size}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      screen_size: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Graphics / GPU
              </label>
              <input
                type="text"
                value={formData.graphics}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, graphics: e.target.value }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Software Compatibility */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Compatible Software *
              </label>
              <div className="space-y-2">
                {SOFTWARE.map((software) => (
                  <label
                    key={software}
                    className="flex items-center gap-3 cursor-pointer p-3 border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.compatible_software.includes(software)}
                      onChange={() => handleSoftwareToggle(software)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="font-medium text-slate-900">{software}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stock Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-300 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.is_in_stock}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      is_in_stock: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="font-medium text-slate-900">In Stock</span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || uploadingImage}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading || uploadingImage
                  ? 'Updating...'
                  : 'Update Gadget'}
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
              <Link href="/admin/dashboard" className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
