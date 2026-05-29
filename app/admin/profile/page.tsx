'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function AdminProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    newEmail: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
        setFormData(prev => ({
          ...prev,
          email: authUser.email || '',
        }))
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
        setError('All password fields are required')
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match')
        return
      }

      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters')
        return
      }

      const supabase = createClient()

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Password updated successfully!')
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.newEmail) {
        setError('New email is required')
        return
      }

      if (formData.newEmail === formData.email) {
        setError('New email must be different from current email')
        return
      }

      const supabase = createClient()

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: formData.newEmail,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess('Email update initiated. Please check your new email to confirm.')
      setFormData(prev => ({
        ...prev,
        newEmail: '',
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to update email')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Profile</h1>
          <p className="text-slate-600 mt-2">Manage your account settings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid gap-6">
          {/* Current Email Display */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Current Account</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-900">
                  {formData.email}
                </div>
              </div>
            </div>
          </Card>

          {/* Change Email */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Change Email</h2>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  value={formData.newEmail}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      newEmail: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="your-new-email@example.com"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Updating...' : 'Update Email'}
              </Button>
              <p className="text-xs text-slate-600 mt-2">
                A confirmation link will be sent to your new email address.
              </p>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter your new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Confirm your new password"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Card>

          {/* Logout Button */}
          <Card className="p-6 bg-slate-100 border-slate-200">
            <Button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/admin/login')
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
