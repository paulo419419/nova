import { createAdminClient } from '@/lib/supabase/server-admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export interface Product {
  id: string
  name: string
  category: string
  description?: string
  price: number
  currency: string
  specs?: string
  budget_tier?: string
  compatible_software?: string
  image_url?: string
  stock_quantity: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

// Get all products
export async function getProducts() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

// Get products by category
export async function getProductsByCategory(category: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return data as Product[]
}

// Get products by budget tier
export async function getProductsByBudget(budgetTier: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('budget_tier', budgetTier)
    .order('price', { ascending: true })

  if (error) {
    console.error('Error fetching products by budget:', error)
    return []
  }

  return data as Product[]
}

// Get featured products
export async function getFeaturedProducts() {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(6)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data as Product[]
}

// Get single product by ID
export async function getProductById(id: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product
}

// Admin: Create product
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    return null
  }

  return data as Product
}

// Admin: Update product
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    return null
  }

  return data as Product
}

// Admin: Delete product
export async function deleteProduct(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return false
  }

  return true
}
