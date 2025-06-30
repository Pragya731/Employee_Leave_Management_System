'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Star, Calendar, Clock, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee/home' },
  { icon: Star, label: 'Score', href: '/employee/score' },
  { icon: Calendar, label: 'Available Leaves', href: '/employee/pending-leaves' },
  { icon: Clock, label: 'Leave Request', href: '/employee/leave-request' },
  { icon: History, label: 'Total Leave History', href: '/employee/leave-history' },
]

type LeaveEntry = {
  id: string
  type: string
  startDate: string
  endDate: string
  status: 'Approved' | 'Rejected' | 'Pending'
  reason?: string
}

export default function EmployeeLeaveHistory() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [leaveHistory, setLeaveHistory] = useState<LeaveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  //const handleLogout = () => {
  //  router.push('/login')
  //}
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  useEffect(() => {
    const fetchLeaveHistory = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/history`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()

        console.log('Fetched Leave History:', data);
        setLeaveHistory(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveHistory()
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar
        items={sidebarItems}
        isMinimized={isMinimized}
        toggleMinimize={() => setIsMinimized(!isMinimized)}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Total Leave History</h1>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center">
                <History className="mr-2" /> Leave History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : leaveHistory.length === 0 ? (
                <p className="text-slate-500">You have no leave history yet.</p>
              ) : (
                <ul className="space-y-4">
                  {leaveHistory.map((leave, index) => (
                    <li key={leave.id || index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b pb-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-indigo-600">{leave.type}</span>
                          <Badge variant={
                            leave.status === 'Approved'
                              ? 'default'
                              : leave.status === 'Rejected'
                                ? 'destructive'
                                : 'secondary'
                          }>
                            {leave.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {format(new Date(leave.startDate), 'MMM dd, yyyy')} to {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                        </p>
                        {leave.reason && (
                          <p className="text-xs text-slate-400 italic mt-1">
                            {leave.reason.length > 60 ? leave.reason.slice(0, 60) + '...' : leave.reason}
                          </p>
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
