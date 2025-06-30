'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import {
  LayoutDashboard,
  Star,
  Calendar,
  Clock,
  History,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Progress } from '@/components/ui/progress'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee/home' },
  { icon: Star, label: 'Score', href: '/employee/score' },
  { icon: Calendar, label: 'Available Leaves', href: '/employee/pending-leaves' },
  { icon: Clock, label: 'Leave Request', href: '/employee/leave-request' },
  { icon: History, label: 'Total Leave History', href: '/employee/leave-history' },
]

interface Leave {
  _id: string
  type: string
  startDate: string
  endDate: string
  status: string
  reason?: string
}

interface Holiday {
  _id: string
  name: string
  date: string
}

interface LeaveBalance {
  leaveType: string
  balance: number
}

export default function EmployeeHome() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [leaveHistory, setLeaveHistory] = useState<Leave[]>([])
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [performance, setPerformance] = useState<{ score: number; percent: number; rating: string } | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const headers = { Authorization: `Bearer ${token}` }

        const [userRes, leaveBalRes, leavesRes, holidayRes, perfRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/me`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/leave-balance`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/upcoming-holidays`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/score`, { headers }),
        ])

        if (!userRes.ok || !leaveBalRes.ok || !leavesRes.ok || !holidayRes.ok || !perfRes.ok) {
          throw new Error('One or more requests failed.')
        }

        const perfData = await perfRes.json()

        // Calculate percent (assuming it's out of 100) and derive a rating
        const score = perfData.overallScore
        const percent = Math.round(score) // or use score directly
        let rating = ''

        if (score >= 90) rating = 'Excellent'
        else if (score >= 75) rating = 'Very Good'
        else if (score >= 60) rating = 'Good'
        else if (score >= 40) rating = 'Average'
        else rating = 'Poor'

        setPerformance({ score, percent, rating })

        const userData = await userRes.json()
        setEmployeeName(userData.name)

        const balancesData = await leaveBalRes.json()
        setLeaveBalances(Array.isArray(balancesData) ? balancesData : [])

        const leavesData = await leavesRes.json()
        setLeaveHistory(Array.isArray(leavesData) ? leavesData : [])

        const holidayData = await holidayRes.json()
        setHolidays(Array.isArray(holidayData) ? holidayData : [])
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }

    fetchData()
  }, [])

  const totalBalance = leaveBalances.reduce((sum, lb) => sum + lb.balance, 0)
  const percentageUsed = Math.round(((30 - totalBalance) / 30) * 100)
  const pendingRequests = leaveHistory.filter((l) => l.status === 'Pending')

  //const handleLogout = () => {
  //  localStorage.removeItem('token')
  //  router.push('/login')
  //}
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar
        items={sidebarItems}
        isMinimized={isMinimized}
        toggleMinimize={() => setIsMinimized(!isMinimized)}
        onLogout={() => setShowLogoutConfirm(true)}
      />
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Welcome, {employeeName}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* Leave Balance */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <CircleDollarSign size={20} />
                    </div>
                    Leave Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  {leaveBalances.length > 0 ? (
                    <ul className="space-y-3">
                      {leaveBalances.map((item) => (
                        <li
                          key={item.leaveType}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <span className="font-medium text-blue-900 capitalize">{item.leaveType}</span>
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                            {item.balance} days
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 text-sm mt-2">No leave balance data found.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Requests */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Clock size={20} />
                    </div>
                    Pending Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  <p className="text-4xl font-semibold text-yellow-600">{pendingRequests.length}</p>
                  <ul className="mt-2 text-sm text-slate-600 space-y-1">
                    {pendingRequests.slice(0, 2).map((req) => (
                      <li key={req._id}>
                        • {req.type} (
                        {Math.ceil(
                          (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                          (1000 * 3600 * 24)
                        ) + 1} days)
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance Score */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <TrendingUp size={20} />
                    </div>
                    Performance Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  {performance ? (
                    <>
                      <p className="text-4xl font-semibold text-green-600">{performance.score} / 100</p>
                      <Progress value={performance.percent} className="mt-2" />
                      <p className="text-sm text-slate-500 mt-2">{performance.rating}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">Performance data not available.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Leave History */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                  <div className="bg-white/20 p-2 rounded-full">
                    <History size={20} />
                  </div>
                  Recent Leave History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="space-y-4 mt-4">
                  {Array.isArray(leaveHistory) && leaveHistory.length > 0 ? (
                    leaveHistory.slice(0, 3).map((leave) => (
                      <li key={leave._id} className="flex justify-between items-start border-b pb-3">
                        <div>
                          <p className="font-semibold text-indigo-600 capitalize">{leave.type} Leave</p>
                          <p className="text-sm text-slate-500">{leave.reason || "No reason provided"}</p>
                        </div>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md whitespace-nowrap">
                          {new Date(leave.startDate).toLocaleDateString()} –{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500 text-sm">No leave history available.</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>


        </motion.div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Confirm Logout</h2>
                <p>Are you sure you want to log out?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )

}
