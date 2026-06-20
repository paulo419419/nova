'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Complaint {
  id: string
  name: string
  email: string
  phone?: string
  product_id?: string
  complaint_type: string
  message: string
  status: string
  admin_response?: string
  is_read: boolean
  created_at: string
  product_name?: string
}

export default function ComplaintsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [response, setResponse] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

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
        await fetchComplaints()
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints')
      const data = await res.json()

      if (data.success) {
        setComplaints(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)
    }
  }

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('complaints')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)

      if (!error) {
        setComplaints(complaints.map(c => 
          c.id === complaintId ? { ...c, status: newStatus } : c
        ))
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint({ ...selectedComplaint, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const markAsRead = async (complaintId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('complaints')
        .update({ is_read: true })
        .eq('id', complaintId)

      if (!error) {
        setComplaints(complaints.map(c => 
          c.id === complaintId ? { ...c, is_read: true } : c
        ))
        if (selectedComplaint?.id === complaintId) {
          setSelectedComplaint({ ...selectedComplaint, is_read: true })
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleSubmitResponse = async () => {
    if (!selectedComplaint || !response.trim()) return

    setSubmittingResponse(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('complaints')
        .update({
          admin_response: response,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedComplaint.id)

      if (!error) {
        const updatedComplaint = {
          ...selectedComplaint,
          admin_response: response,
          status: 'resolved'
        }
        setSelectedComplaint(updatedComplaint)
        setComplaints(complaints.map(c => 
          c.id === selectedComplaint.id ? updatedComplaint : c
        ))
        setResponse('')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
    } finally {
      setSubmittingResponse(false)
    }
  }

  const filteredComplaints = filterStatus === 'all' 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus)

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Complaints</h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage customer complaints and feedback
              </p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="outline">← Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Complaints List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['all', 'pending', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)} (
                  {complaints.filter(c => status === 'all' || c.status === status).length})
                </button>
              ))}
            </div>

            {/* Complaints Cards */}
            <div className="space-y-3">
              {filteredComplaints.length === 0 ? (
                <Card className="p-6 text-center text-slate-600">
                  No complaints found
                </Card>
              ) : (
                filteredComplaints.map((complaint) => (
                  <Card
                    key={complaint.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedComplaint?.id === complaint.id
                        ? 'border-blue-500 border-2'
                        : 'border-slate-200'
                    } ${!complaint.is_read ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setSelectedComplaint(complaint)
                      if (!complaint.is_read) markAsRead(complaint.id)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{complaint.name}</h3>
                          {!complaint.is_read && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{complaint.email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                        complaint.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-2">{complaint.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(complaint.created_at).toLocaleDateString()} {' '}
                      {new Date(complaint.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedComplaint && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-20">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Complaint Details</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Name</p>
                    <p className="text-slate-900">{selectedComplaint.name}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
                    <p className="text-slate-900 break-all">{selectedComplaint.email}</p>
                  </div>

                  {selectedComplaint.phone && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase">Phone</p>
                      <p className="text-slate-900">{selectedComplaint.phone}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Type</p>
                    <p className="text-slate-900 capitalize">{selectedComplaint.complaint_type?.replace(/_/g, ' ')}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Message</p>
                    <p className="text-slate-900">{selectedComplaint.message}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase">Status</p>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Response Section */}
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Your Response</p>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Type your response to the complaint..."
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <Button
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || submittingResponse}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                  >
                    {submittingResponse ? 'Sending...' : 'Send Response & Resolve'}
                  </Button>
                </div>

                {selectedComplaint.admin_response && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-semibold text-green-700 mb-1">YOUR RESPONSE:</p>
                    <p className="text-sm text-green-900">{selectedComplaint.admin_response}</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
