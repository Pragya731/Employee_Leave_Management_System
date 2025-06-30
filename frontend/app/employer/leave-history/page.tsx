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
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
]

interface LeaveHistory {
  _id: string
  userId: { firstName: string; lastName: string; department: string }
  leaveTypeId: { name: string }
  startDate: string
  endDate: string
  status: 'Pending' | 'Approved' | 'Rejected'
}

export default function EmployerLeaveHistory() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [leaveHistory, setLeaveHistory] = useState<LeaveHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const router = useRouter()

  useEffect(() => {
    fetchLeaveHistory()
  }, [])

  const fetchLeaveHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const text = await res.text()

      try {
        const data = JSON.parse(text)
        setLeaveHistory(data)
      } catch (err) {
        console.error('Non-JSON response:', text)
        throw new Error('Invalid JSON response')
      }
    } catch (err) {
      console.error('Failed to fetch leave history:', err)
      alert('Error loading leave history.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'secondary'
      case 'Rejected':
        return 'destructive'
      case 'Pending':
      default:
        return 'outline'
    }
  }

  const filteredAndSortedHistory = leaveHistory
  .filter((leave) => {
    const fullName = `${leave.userId?.firstName || ''} ${leave.userId?.lastName || ''}`.toLowerCase()
    const department = leave.userId?.department?.toLowerCase() || ''
    const term = searchTerm.toLowerCase()
    return fullName.includes(term) || department.includes(term)
  })
  .sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.startDate).getTime() || 0
      const dateB = new Date(b.startDate).getTime() || 0
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    } else if (sortBy === 'status') {
      const statusOrder = ['pending', 'approved', 'rejected']
      const valA = statusOrder.indexOf(a.status.toLowerCase())
      const valB = statusOrder.indexOf(b.status.toLowerCase())
      return sortOrder === 'asc' ? valA - valB : valB - valA
    }
    return 0
  })


  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Leave History</h1>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <span className="flex items-center mb-4 md:mb-0">
                  <History className="mr-2" /> All Leave Records
                </span>
                <div className="flex gap-4 items-center flex-wrap">
                  <input
                    type="text"
                    placeholder="Search by name or department"
                    className="text-slate-800 rounded-md px-3 py-1 text-sm w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'status')}
                    className="text-slate-800 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="status">Sort by Status</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="text-slate-800 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500">Loading leave history...</p>
              ) : filteredAndSortedHistory.length === 0 ? (
                <p className="text-center text-gray-500">No leave history found.</p>
              ) : (
                <ul className="space-y-5">
                  {filteredAndSortedHistory.map((leave) => (
                    <li
                      key={leave._id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4"
                    >
                      <div>
                        <p className="font-semibold text-purple-600">
                          {leave.userId?.firstName} {leave.userId?.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{leave.userId?.department}</p>
                        <p className="text-sm text-slate-500">
                          {leave.leaveTypeId?.name} leave: {formatDate(leave.startDate)} →{' '}
                          {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <Badge className="mt-2 md:mt-0" variant={getBadgeVariant(leave.status)}>
                        {leave.status}
                      </Badge>
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
