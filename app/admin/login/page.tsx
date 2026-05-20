'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
              `${window.location.origin}/auth/callback`,
            data: {
              is_admin: true,
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          return
        }

        if (data.user) {
          // Add to admin_users table
          const { error: dbError } = await supabase
            .from('admin_users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email,
              },
            ])

          if (dbError && !dbError.message.includes('duplicate')) {
            setError(dbError.message)
            return
          }

          setError('Check your email to confirm your account')
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword(
          {
            email,
            password,
          }
        )

        if (signInError) {
          setError(signInError.message)
          return
        }

        if (data.user) {
          router.push('/admin/dashboard')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/nova-gadgets-logo.jpg"
              alt="NOVA GADGETS"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="font-bold text-slate-900">NOVA</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-6 md:p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-600 text-sm">
              {isSignUp
                ? 'Create admin account to manage gadgets'
                : 'Sign in to manage your store'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@novagadgets.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </Button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-4 text-center text-sm text-slate-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false)
                    setError('')
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true)
                    setError('')
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Create one
                </button>
              </>
            )}
          </div>

          {/* Back to Store */}
          <Link href="/">
            <Button variant="outline" className="w-full mt-4">
              Back to Store
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  )
}
