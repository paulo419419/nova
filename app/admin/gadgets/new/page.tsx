'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Laptop', 'Mobile Phone', 'AirPods', 'Tablet', 'Monitor', 'Keyboard', 'Mouse', 'External SSD', 'Other']
const BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Google', 'OnePlus', 'Sony']
const PROCESSORS = ['Core i5', 'Core i7', 'Core i9', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'M1', 'M2', 'M3', 'Snapdragon', 'Exynos', 'A14', 'A15', 'A16']
const GENERATIONS = ['7th Gen', '8th Gen', '10th Gen', '11th Gen', '12th Gen', '13th Gen', '14th Gen']
const SOFTWARE = ['Adobe Premiere', 'DaVinci Resolve', 'CapCut']
const PRICE_CATEGORIES = ['100k', '200k', '300k', 'above']

export default function AddGadgetPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Laptop',
    brand: '',
    processor: '',
    processor_generation: '',
    ram_gb: '8',
    storage_gb: '256',
    screen_size: '15.6',
    graphics: '',
    compatible_software: [] as string[],
    price_category: '200k',
    device_condition: 'new',
    is_in_stock: true,
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
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // Add new files to existing array
      setImageFiles(prev => [...prev, ...files])
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => {
    const input = document.getElementById('image-upload') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-400')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-400')
    
    const files = Array.from(e.dataTransfer.files || []).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files])
      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return []

    try {
      setUploadingImage(true)
      const uploadedUrls: string[] = []

      for (const imageFile of imageFiles) {
        const formData = new FormData()
        formData.append('file', imageFile)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            console.error('[v0] Upload response error:', error)
            throw new Error(error.error || 'Upload failed')
          }

          const data = await response.json()
          if (data.url) {
            uploadedUrls.push(data.url)
          }
        } catch (uploadErr) {
          console.error('[v0] Individual file upload error:', uploadErr)
          // Continue with other files instead of failing completely
          continue
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error('No images uploaded successfully')
      }

      return uploadedUrls
    } catch (err) {
      console.error('[v0] Image upload error:', err)
      setError(`Failed to upload images: ${err instanceof Error ? err.message : 'Unknown error'}`)
      return []
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
      // Upload images if provided
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        imageUrls = await uploadImages()
        if (imageUrls.length === 0) {
          setLoading(false)
          return
        }
      }

      // Save to database with primary image (first image)
      const supabase = createClient()
      const { data: productData, error: dbError } = await supabase.from('products').insert([
        {
          ...formData,
          price: parseFloat(formData.price),
          ram_gb: parseInt(formData.ram_gb),
          storage_gb: formData.storage_gb ? parseInt(formData.storage_gb) : null,
          screen_size: formData.screen_size ? parseFloat(formData.screen_size) : null,
          image_url: imageUrls[0] || null,
        },
      ]).select()

      if (dbError) throw dbError

      // If we have additional images, save them to product_images table
      if (imageUrls.length > 1 && productData && productData[0]) {
        const productId = productData[0].id
        const additionalImages = imageUrls.slice(1).map((url, index) => ({
          product_id: productId,
          image_url: url,
          display_order: index + 1,
        }))

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(additionalImages)

        if (imagesError) {
          console.error('Failed to save additional images:', imagesError)
          // Continue anyway - primary image is saved
        }
      }

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to add gadget')
    } finally {
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
            Add New Gadget
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Multiple Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Product Images <span className="text-slate-600 text-xs">(Upload multiple images)</span>
              </label>
              
              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 w-full border border-slate-200 rounded-lg overflow-hidden">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 text-center mt-1">
                        {index === 0 ? 'Primary' : `Image ${index + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-all cursor-pointer active:bg-slate-100"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-slate-600 mb-4">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="font-medium mb-1">Drag and drop images here</p>
                  <p className="text-sm">or click the button below to select images from your device</p>
                  <p className="text-xs text-slate-500 mt-2">Supported: PNG, JPG, JPEG, GIF, WebP</p>
                </div>
                <input
                  type="file"
                  accept="image/*,.png,.jpg,.jpeg,.gif,.webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  multiple
                  aria-label="Upload product images"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full px-6 py-2 font-medium"
                  onClick={triggerFileInput}
                >
                  {imageFiles.length > 0 ? '+ Add More Images' : '+ Choose Images'}
                </Button>
              </div>
              {imageFiles.length > 0 && (
                <p className="text-sm text-slate-600 mt-2">
                  {imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''} selected
                </p>
              )}
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
                  placeholder="e.g. MacBook Pro 15-inch"
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
                  placeholder="350000"
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
                placeholder="Describe the product..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Product Category */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Product Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Category and Device Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Device Condition *
                </label>
                <select
                  value={formData.device_condition}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      device_condition: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>
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
                  placeholder="256"
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
                  placeholder="15.6"
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
                placeholder="e.g. RTX 4060, M3 Pro"
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
                  ? 'Adding gadget...'
                  : 'Add Gadget'}
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
