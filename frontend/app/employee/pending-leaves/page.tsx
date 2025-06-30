'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Star, Calendar, Clock, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import axios from 'axios'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee/home' },
  { icon: Star, label: 'Score', href: '/employee/score' },
  { icon: Calendar, label: 'Available Leaves', href: '/employee/pending-leaves' },
  { icon: Clock, label: 'Leave Request', href: '/employee/leave-request' },
  { icon: History, label: 'Total Leave History', href: '/employee/leave-history' },
]

interface LeaveRequest {
  leaveType: string
  startDate: string
  endDate: string
  totalDays: number
}

interface LeaveBalance {
  leaveType: string
  balance: number
}

export default function EmployeePendingLeaves() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([])
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([])
  const router = useRouter()

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!userId) return

    console.log("employeeId from localStorage:", userId);

    const fetchLeaveBalance = async () => {
      try {
        const token = localStorage.getItem('token');

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/leave-balance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
        console.log("Leave Balance API response:", res.data);
        setLeaveBalance(res.data)
      } catch (err) {
        console.error('Error fetching leave balances:', err)
      }
    }

    const fetchPendingLeaves = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests/pending`)
        console.log("Pending Leave Requests API response:", res.data);
        setPendingLeaves(res.data)
      } catch (err) {
        console.error('Error fetching pending leaves:', err)
      }
    }

    fetchLeaveBalance()
    fetchPendingLeaves()
  }, [userId])

  //const handleLogout = () => {
  //  router.push('/login')
  //}
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-teal-100">
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
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Pending Leaves</h1>

          {/* Leave Balances Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8">
            <CardHeader className="bg-green-500 text-white">
              <CardTitle>Leave Balances</CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              {leaveBalance.length > 0 ? (
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {leaveBalance.map((item, index) => (
                    <li key={index} className="text-center bg-green-100 p-4 rounded shadow">
                      <p className="text-lg font-semibold">{item.leaveType}</p>
                      <p className="text-3xl text-green-600 font-bold">{item.balance} days</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-center">Loading leave balances...</p>
              )}
            </CardContent>
          </Card>

          {/* Pending Leave Requests Card */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle>Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length > 0 ? (
                <ul className="space-y-4">
                  {pendingLeaves.map((leave, index) => (
                    <li key={index} className="flex justify-between items-center border-b pb-2">
                      <span className="font-semibold">{leave.leaveType}</span>
                      <span className="text-slate-500">
                        {formatDateRange(leave.startDate, leave.endDate, leave.totalDays)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500">No pending leave requests.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

function formatDateRange(start: string, end: string, days: number) {
  const startDate = new Date(start).toLocaleDateString()
  const endDate = new Date(end).toLocaleDateString()
  return start === end
    ? `${startDate} (${days} day)`
    : `${startDate} - ${endDate} (${days} days)`
}
