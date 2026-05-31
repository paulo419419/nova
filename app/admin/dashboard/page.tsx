'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Gadget {
  id: string
  name: string
  price: number
  brand: string
  processor: string
  is_featured: boolean
  image_url?: string
}

interface Stats {
  totalGadgets: number
  totalOrders: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [gadgets, setGadgets] = useState<Gadget[]>([])
  const [stats, setStats] = useState<Stats>({
    totalGadgets: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'gadgets' | 'orders' | 'admins' | 'complaints'>('overview')
  const [deleting, setDeleting] = useState<string | null>(null)

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
        await fetchGadgets()
        await fetchStats()
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchGadgets = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, brand, processor, is_featured, image_url')
        .order('created_at', { ascending: false })

      if (error) {
        if (error.message?.includes('schema cache')) {
          console.log('[v0] Products table does not exist yet. Run /api/setup-db first')
        }
        setGadgets([])
        return
      }
      setGadgets(data || [])
    } catch (error) {
      console.error('[v0] Error fetching gadgets:', error)
      setGadgets([])
    }
  }

  const handleDeleteGadget = async (gadgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this gadget? This action cannot be undone.')) {
      return
    }

    setDeleting(gadgetId)
    try {
      const response = await fetch(`/api/gadgets/${gadgetId}/delete`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGadgets(gadgets.filter((g) => g.id !== gadgetId))
        setStats((prev) => ({
          ...prev,
          totalGadgets: prev.totalGadgets - 1,
        }))
      } else {
        alert('Failed to delete gadget')
      }
    } catch (error) {
      console.error('Error deleting gadget:', error)
      alert('Error deleting gadget')
    } finally {
      setDeleting(null)
    }
  }

  const fetchStats = async () => {
    try {
      const supabase = createClient()

      // Get total gadgets - handle missing table
      let gadgetCount = 0
      const gadgetsResult = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      if (!gadgetsResult.error) {
        gadgetCount = gadgetsResult.count || 0
      }

      // Get total orders - handle missing table
      let orderCount = 0
      const ordersResult = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      if (!ordersResult.error) {
        orderCount = ordersResult.count || 0
      }

      // Get total revenue - handle missing table
      let totalRevenue = 0
      try {
        const { data: orderData } = await supabase
          .from('orders')
          .select('total_price')
          .eq('payment_status', 'completed')

        if (orderData) {
          totalRevenue = orderData.reduce(
            (sum, order) => sum + (order.total_price || 0),
            0
          )
        }
      } catch (e) {
        // Orders table doesn't exist yet
        totalRevenue = 0
      }

      setStats({
        totalGadgets: gadgetCount || 0,
        totalOrders: orderCount || 0,
        totalRevenue,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={32}
              height={32}
              className="rounded"
            />
            <div>
              <h1 className="font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-xs text-slate-600">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                View Store
              </Button>
            </Link>
            <Link href="/admin/profile">
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {(['overview', 'gadgets', 'orders', 'complaints', 'admins'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === t
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-6">
                <div className="text-slate-600 text-sm font-medium mb-2">
                  Total Gadgets
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.totalGadgets}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-slate-600 text-sm font-medium mb-2">
                  Total Orders
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.totalOrders}
                </div>
              </Card>
              <Card className="p-6">
                <div className="text-slate-600 text-sm font-medium mb-2">
                  Total Revenue
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  ₦{stats.totalRevenue.toLocaleString()}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/gadgets/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Add New Gadget
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setTab('orders')}
                >
                  View Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTab('gadgets')}
                >
                  Manage Gadgets
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Gadgets Tab */}
        {tab === 'gadgets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Manage Gadgets
              </h2>
              <Link href="/admin/gadgets/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Add New Gadget
                </Button>
              </Link>
            </div>

            {gadgets.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-600 mb-4">No gadgets added yet</p>
                <Link href="/admin/gadgets/new">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Add Your First Gadget
                  </Button>
                </Link>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Brand / Processor
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {gadgets.map((gadget) => (
                        <tr key={gadget.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            {gadget.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {gadget.brand} • {gadget.processor}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            ₦{gadget.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                gadget.is_in_stock
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {gadget.is_in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm flex gap-2">
                            <Link href={`/admin/gadgets/${gadget.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteGadget(gadget.id)}
                              disabled={deleting === gadget.id}
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              {deleting === gadget.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Orders
            </h2>
            <Card className="p-8 text-center">
              <p className="text-slate-600">
                Orders management coming soon
              </p>
            </Card>
          </div>
        )}

        {/* Complaints Tab */}
        {tab === 'complaints' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Customer Complaints
              </h2>
              <Link href="/admin/complaints">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  View All Complaints
                </Button>
              </Link>
            </div>
            <Card className="p-8 text-center">
              <p className="text-slate-600 mb-4">
                Click the button above to manage customer complaints and feedback
              </p>
            </Card>
          </div>
        )}

        {/* Admins Tab */}
        {tab === 'admins' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Admin Accounts
              </h2>
              <Link href="/admin/add-admin">
                <Button>Add New Admin</Button>
              </Link>
            </div>
            <Card className="p-6">
              <p className="text-slate-600 text-sm">
                Only existing admins can create new admin accounts. Use the "Add New Admin" button to register a new administrator.
              </p>
            </Card>
          </div>
        )}
      </div>
    </main>
  )
}
