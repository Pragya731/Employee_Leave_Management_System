'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import {
  LayoutDashboard,
  Users,
  Building,
  Clock,
  History,
  BarChart,
  Check,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
]

interface User {
  firstName: string
  lastName: string
}

interface LeaveType {
  name: string
}

interface LeaveRequest {
  _id: string
  userId: User
  leaveTypeId: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: string
}

export default function EmployerLeaveRequests() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [rejectionVisibility, setRejectionVisibility] = useState<{ [key: string]: boolean }>({})
  const router = useRouter()

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      if (response.status === 401) {
        alert('Session expired. Please log in again.')
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: LeaveRequest[] = await response.json()

      // Sort by startDate ascending
      const sorted = [...data].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )

      setLeaveRequests(sorted)
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      alert('Failed to fetch leave requests. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (
    id: string,
    status: 'Approved' | 'Rejected',
    rejectionReason?: string
  ) => {
    if (
      status === 'Rejected' &&
      (!rejectionReason || rejectionReason.trim().length === 0)
    ) {
      alert('Please enter a reason for rejection.')
      return
    }

    const confirmAction = window.confirm(
      `Are you sure you want to ${status.toLowerCase()} this leave request?`
    )
    if (!confirmAction) return

    try {
      const payload: any = { status: status.toLowerCase() }
      if (status === 'Rejected') payload.rejectionReason = rejectionReason

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (res.ok) {
        fetchLeaveRequests()
      } else {
        const errData = await res.json()
        alert(errData.message || 'Update failed')
      }
    } catch (error) {
      console.error('Update failed:', error)
      alert('Failed to update status')
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <Sidebar
        items={sidebarItems}
        isMinimized={isMinimized}
        toggleMinimize={() => setIsMinimized(!isMinimized)}
        onLogout={() => router.push('/login')}
      />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Leave Requests</h1>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardTitle className="flex items-center">
                <Clock className="mr-2" /> Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500">Loading leave requests...</p>
              ) : leaveRequests.length === 0 ? (
                <p className="text-center text-gray-500">No pending leave requests.</p>
              ) : (
                <ul className="space-y-6">
                  {leaveRequests.map((request) => (
                    <li
                      key={request._id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4"
                    >
                      <div>
                        <p className="font-semibold text-orange-600">
                          {request.userId?.firstName} {request.userId?.lastName}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.leaveTypeId?.name} leave: {formatDate(request.startDate)} →{' '}
                          {formatDate(request.endDate)}
                        </p>
                        <p className="text-sm text-slate-500">Reason: {request.reason}</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mt-2 md:mt-0">
                        <Badge variant="secondary" className="capitalize">
                          {request.status}
                        </Badge>

                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusChange(request._id, 'Approved')}
                        >
                          <Check size={16} className="mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() =>
                            setRejectionVisibility((prev) => ({
                              ...prev,
                              [request._id]: !prev[request._id],
                            }))
                          }
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </Button>

                        {rejectionVisibility[request._id] && (
                          <div className="flex flex-col space-y-2 mt-2 w-full">
                            <input
                              type="text"
                              placeholder="Reason for rejection"
                              className="px-3 py-1 border border-gray-300 rounded text-sm w-full"
                              value={rejectionReasons[request._id] || ''}
                              onChange={(e) =>
                                setRejectionReasons((prev) => ({
                                  ...prev,
                                  [request._id]: e.target.value,
                                }))
                              }
                            />
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() =>
                                handleStatusChange(
                                  request._id,
                                  'Rejected',
                                  rejectionReasons[request._id]
                                )
                              }
                            >
                              Send
                            </Button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
