'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface Tab {
  id: string
  label: string
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('email')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    senderEmail: '',
    senderName: 'JenzigtrucksForSale',
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
  })

  // API settings
  const [apiSettings, setApiSettings] = useState({
    paystackPublicKey: '',
    paystackSecretKey: '',
    whatsappNumber: '+2347036947900',
    gmail_address: '',
    gmail_password: '',
  })

  // Brand management
  const [brands, setBrands] = useState<string[]>([])
  const [newBrand, setNewBrand] = useState('')

  // Software options
  const [softwareOptions, setSoftwareOptions] = useState<string[]>([])
  const [newSoftware, setNewSoftware] = useState('')

  // Processor options
  const [processors, setProcessors] = useState<string[]>([])
  const [newProcessor, setNewProcessor] = useState('')

  // RAM options
  const [ramOptions, setRamOptions] = useState<{ value: number; label: string }[]>([])
  const [newRam, setNewRam] = useState('')

  // Storage options
  const [storageOptions, setStorageOptions] = useState<{ value: number; label: string }[]>([])
  const [newStorage, setNewStorage] = useState('')

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) router.push('/admin/login')
      else setUser(authUser)
    }
    checkAuth()
  }, [router])

  const loadSettings = async () => {
    try {
      const supabase = createClient()

      // Load email settings
      const { data: emailData } = await supabase
        .from('admin_settings')
        .select('*')
        .in('setting_key', ['senderEmail', 'senderName', 'smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword'])

      if (emailData) {
        const settings: any = {}
        emailData.forEach(row => {
          settings[row.setting_key] = row.setting_value
        })
        setEmailSettings(prev => ({ ...prev, ...settings }))
      }

      // Load API settings - Paystack and Gmail
      const { data: paystackData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'paystack_config')
        .single()

      if (paystackData) {
        try {
          const payStackConfig = JSON.parse(paystackData.setting_value || '{}')
          setApiSettings(prev => ({
            ...prev,
            paystackPublicKey: payStackConfig.publicKey || '',
            paystackSecretKey: payStackConfig.secretKey || ''
          }))
        } catch (e) {
          console.error('Error parsing Paystack config:', e)
        }
      }

      const { data: gmailData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'email_config')
        .single()

      if (gmailData) {
        try {
          const emailConfig = JSON.parse(gmailData.setting_value || '{}')
          setApiSettings(prev => ({
            ...prev,
            gmail_address: emailConfig.gmailAddress || '',
            gmail_password: emailConfig.gmailAppPassword || ''
          }))
        } catch (e) {
          console.error('Error parsing email config:', e)
        }
      }

      // Load brands
      const { data: brandData } = await supabase.from('brands').select('name').order('name')
      if (brandData) setBrands(brandData.map(b => b.name))

      // Load software
      const { data: softData } = await supabase.from('software_options').select('name').order('name')
      if (softData) setSoftwareOptions(softData.map(s => s.name))

      // Load processors
      const { data: procData } = await supabase.from('processors').select('name').order('name')
      if (procData) setProcessors(procData.map(p => p.name))

      // Load RAM options
      const { data: ramData } = await supabase.from('ram_options').select('value, label').order('value')
      if (ramData) setRamOptions(ramData)

      // Load storage options
      const { data: storageData } = await supabase.from('storage_options').select('value, label').order('value')
      if (storageData) setStorageOptions(storageData)
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const saveEmailSettings = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      for (const [key, value] of Object.entries(emailSettings)) {
        // Check if exists first
        const { data: existingData } = await supabase
          .from('admin_settings')
          .select('id')
          .eq('setting_key', key)
          .single()

        if (existingData) {
          // Update existing
          await supabase
            .from('admin_settings')
            .update({
              setting_value: String(value),
              updated_at: new Date().toISOString()
            })
            .eq('setting_key', key)
        } else {
          // Insert new
          await supabase
            .from('admin_settings')
            .insert({
              setting_key: key,
              setting_value: String(value),
              description: `Email ${key}`
            })
        }
      }
      setMessage('Email settings saved successfully')
      setTimeout(() => setMessage(''), 3000)
      await loadSettings()
    } catch (err) {
      console.error('Error saving email settings:', err)
      setError('Failed to save email settings')
    } finally {
      setLoading(false)
    }
  }

  const saveApiSettings = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // First, check if record exists
      const { data: existingData } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'paystack_config')
        .single()

      let error
      if (existingData) {
        // Update if exists
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({
            setting_value: JSON.stringify({
              publicKey: apiSettings.paystackPublicKey || '',
              secretKey: apiSettings.paystackSecretKey || ''
            }),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'paystack_config')
        error = updateError
      } else {
        // Insert if doesn't exist
        const { error: insertError } = await supabase
          .from('admin_settings')
          .insert({
            setting_key: 'paystack_config',
            setting_value: JSON.stringify({
              publicKey: apiSettings.paystackPublicKey || '',
              secretKey: apiSettings.paystackSecretKey || ''
            }),
            description: 'Paystack API Configuration'
          })
        error = insertError
      }

      if (error) throw error

      // Now save Gmail settings
      const { data: existingGmail } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', 'gmail_config')
        .single()

      let gmailError
      if (existingGmail) {
        // Update if exists
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({
            setting_value: JSON.stringify({
              address: apiSettings.gmail_address || '',
              password: apiSettings.gmail_password || ''
            }),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', 'gmail_config')
        gmailError = updateError
      } else {
        // Insert if doesn't exist
        const { error: insertError } = await supabase
          .from('admin_settings')
          .insert({
            setting_key: 'gmail_config',
            setting_value: JSON.stringify({
              address: apiSettings.gmail_address || '',
              password: apiSettings.gmail_password || ''
            }),
            description: 'Gmail API Configuration'
          })
        gmailError = insertError
      }

      if (gmailError) throw gmailError

      setMessage('API settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
      
      // Refresh to show saved values
      await loadApiSettings()
    } catch (err) {
      console.error('Error saving API settings:', err)
      setError('Failed to save API settings. Check permissions.')
    } finally {
      setLoading(false)
    }
  }

  const loadApiSettings = async () => {
    try {
      const supabase = createClient()
      
      // Load Paystack
      const { data: paystackData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'paystack_config')
        .single()

      if (paystackData) {
        try {
          const config = JSON.parse(paystackData.setting_value || '{}')
          setApiSettings(prev => ({
            ...prev,
            paystackPublicKey: config.publicKey || '',
            paystackSecretKey: config.secretKey || ''
          }))
        } catch (e) {
          console.error('Error parsing Paystack config:', e)
        }
      }

      // Load Gmail
      const { data: gmailData } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('setting_key', 'gmail_config')
        .single()

      if (gmailData) {
        try {
          const config = JSON.parse(gmailData.setting_value || '{}')
          setApiSettings(prev => ({
            ...prev,
            gmail_address: config.address || '',
            gmail_password: config.password || ''
          }))
        } catch (e) {
          console.error('Error parsing Gmail config:', e)
        }
      }
    } catch (err) {
      console.error('Error loading API settings:', err)
    }
  }

  const addBrand = async () => {
    if (!newBrand.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('brands').insert({ name: newBrand.trim() })
      setBrands([...brands, newBrand.trim()])
      setNewBrand('')
      setMessage('Brand added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to add brand')
    } finally {
      setLoading(false)
    }
  }

  const addSoftware = async () => {
    if (!newSoftware.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('software_options').insert({ name: newSoftware.trim() })
      setSoftwareOptions([...softwareOptions, newSoftware.trim()])
      setNewSoftware('')
      setMessage('Software option added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to add software')
    } finally {
      setLoading(false)
    }
  }

  const addProcessor = async () => {
    if (!newProcessor.trim()) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('processors').insert({ name: newProcessor.trim() })
      setProcessors([...processors, newProcessor.trim()])
      setNewProcessor('')
      setMessage('Processor added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to add processor')
    } finally {
      setLoading(false)
    }
  }

  const addRamOption = async () => {
    if (!newRam.trim()) return
    const value = parseInt(newRam)
    if (isNaN(value)) {
      setError('Please enter a valid number')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('ram_options').insert({ value, label: `${value}GB` })
      setRamOptions([...ramOptions, { value, label: `${value}GB` }])
      setNewRam('')
      setMessage('RAM option added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to add RAM option')
    } finally {
      setLoading(false)
    }
  }

  const addStorageOption = async () => {
    if (!newStorage.trim()) return
    const value = parseInt(newStorage)
    if (isNaN(value)) {
      setError('Please enter a valid number')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.from('storage_options').insert({ value, label: `${value}GB` })
      setStorageOptions([...storageOptions, { value, label: `${value}GB` }])
      setNewStorage('')
      setMessage('Storage option added successfully')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError('Failed to add storage option')
    } finally {
      setLoading(false)
    }
  }

  const tabs: Tab[] = [
    { id: 'email', label: 'Email Settings' },
    { id: 'api', label: 'API Keys' },
    { id: 'brands', label: 'Brands' },
    { id: 'software', label: 'Software' },
    { id: 'processors', label: 'Processors' },
    { id: 'hardware', label: 'Hardware Options' },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
            <p className="text-slate-600 mt-2">Configure system settings, API keys, and manage options</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Email Configuration</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Sender Email *</label>
                <input
                  type="email"
                  value={emailSettings.senderEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, senderEmail: e.target.value }))}
                  placeholder="noreply@company.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Sender Name</label>
                <input
                  type="text"
                  value={emailSettings.senderName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, senderName: e.target.value }))}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={emailSettings.smtpHost}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                    placeholder="587"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">SMTP Username</label>
                <input
                  type="text"
                  value={emailSettings.smtpUsername}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">SMTP Password</label>
                <input
                  type="password"
                  value={emailSettings.smtpPassword}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button
              onClick={saveEmailSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save Email Settings'}
            </Button>
          </Card>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">API Configuration</h2>
            
            {/* Paystack Config */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-slate-900">Paystack Configuration</h3>
                {apiSettings.paystackPublicKey && (
                  <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    Configured
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Paystack Public Key</label>
                  <input
                    type="text"
                    value={apiSettings.paystackPublicKey || ''}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, paystackPublicKey: e.target.value }))}
                    placeholder="pk_live_..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Get from: https://dashboard.paystack.com/settings/developer</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Paystack Secret Key</label>
                  <input
                    type="password"
                    value={apiSettings.paystackSecretKey || ''}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, paystackSecretKey: e.target.value }))}
                    placeholder="sk_live_..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Gmail Config */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-slate-900">Gmail Configuration</h3>
                {apiSettings.gmail_address ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                      Configured
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {apiSettings.gmail_address}
                    </span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    Not Configured
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Gmail Address</label>
                  <input
                    type="email"
                    value={apiSettings.gmail_address || ''}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, gmail_address: e.target.value }))}
                    placeholder="your@gmail.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Your Gmail address for sending order confirmations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Gmail App Password</label>
                  <input
                    type="password"
                    value={apiSettings.gmail_password || ''}
                    onChange={(e) => setApiSettings(prev => ({ ...prev, gmail_password: e.target.value }))}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">Generate at: https://myaccount.google.com/apppasswords</p>
                </div>
              </div>
            </div>

            <Button
              onClick={saveApiSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save All Settings'}
            </Button>
          </Card>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Manage Brands</h2>
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addBrand()}
                placeholder="Enter new brand name"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={addBrand}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Brand
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {brands.map(brand => (
                <div key={brand} className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                  {brand}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Software Tab */}
        {activeTab === 'software' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Manage Software Options</h2>
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newSoftware}
                onChange={(e) => setNewSoftware(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSoftware()}
                placeholder="Enter software name"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={addSoftware}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Software
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {softwareOptions.map(software => (
                <div key={software} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {software}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Processors Tab */}
        {activeTab === 'processors' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Manage Processors</h2>
            <div className="mb-6 flex gap-2">
              <input
                type="text"
                value={newProcessor}
                onChange={(e) => setNewProcessor(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addProcessor()}
                placeholder="e.g., Intel Core i7, Apple M1"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={addProcessor}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Processor
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {processors.map(processor => (
                <div key={processor} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  {processor}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Hardware Options Tab */}
        {activeTab === 'hardware' && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Manage Hardware Options</h2>
            
            <div className="space-y-8">
              {/* RAM */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">RAM Options (GB)</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={newRam}
                    onChange={(e) => setNewRam(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRamOption()}
                    placeholder="e.g., 32"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={addRamOption}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {ramOptions.map(ram => (
                    <div key={ram.value} className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
                      {ram.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Storage Options (GB)</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStorageOption()}
                    placeholder="e.g., 2048"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={addStorageOption}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {storageOptions.map(storage => (
                    <div key={storage.value} className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
                      {storage.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
