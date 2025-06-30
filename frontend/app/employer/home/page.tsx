'use client'

import React, { useEffect, useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Users, Building, Clock, History, BarChart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { EmployeeSummary, PendingLeave, RecentLeave } from '@/types/dashboard'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
]

export default function EmployerHome() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [employeeData, setEmployeeData] = useState<EmployeeSummary>({ totalEmployees: 0, totalLeaveRequests: 0 })
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([])
  const [recentLeaves, setRecentLeaves] = useState<RecentLeave[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [empRes, leaveRes, historyRes, deptRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/summary`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests/pending`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-requests/leave-history/recent`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/departments`),
        ])

        if (!empRes.ok || !leaveRes.ok || !historyRes.ok || !deptRes.ok) {
          throw new Error('One or more API responses failed.')
        }

        const empData: EmployeeSummary = await empRes.json()
        const leaveData: PendingLeave[] = await leaveRes.json()
        const historyData: RecentLeave[] = await historyRes.json()
        const deptData = await deptRes.json()

        setEmployeeData(empData)
        setPendingLeaves(leaveData)
        setRecentLeaves(historyData)
        setDepartments(deptData.map((d: { name: string }) => d.name))

      } catch (err) {
        console.error("❌ Error fetching dashboard data:", err)
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-gray-300 rounded mb-4 mx-auto"></div>
          <div className="h-6 w-32 bg-gray-300 rounded mb-4 mx-auto"></div>
          <div className="h-6 w-40 bg-gray-300 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Employer Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Employees */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Users size={20} />
                    </div>
                    <span>Total Employees</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground tracking-wide mb-1">Total Employees</p>
                    <p className="text-3xl font-semibold text-purple-700">{employeeData.totalEmployees}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-xs text-muted-foreground tracking-wide mb-1">Total Leave Requests</p>
                    <p className="text-3xl font-semibold text-orange-600">{employeeData.totalLeaveRequests}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Leave Requests */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Clock size={20} />
                    </div>
                    <span>Pending Leaves</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  <p className="text-xs text-muted-foreground tracking-wide mb-1">Pending Requests</p>
                  <p className="text-4xl font-semibold text-orange-600">{pendingLeaves.length}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Departments */}
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
              <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                    <div className="bg-white/20 p-2 rounded-full">
                      <Building size={20} />
                    </div>
                    <span>Departments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-5">
                  <p className="text-4xl font-semibold text-teal-600">{departments.length}</p>
                  <ul className="mt-3 text-sm text-slate-600 space-y-1 max-h-32 overflow-y-auto pr-1">
                    {departments.map((dept, i) => (
                      <li key={i} className="pl-2 border-l-2 border-teal-500">• {dept}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Leave History */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-lg tracking-wide">
                  <div className="bg-white/20 p-2 rounded-full">
                    <History size={20} />
                  </div>
                  <span>Recent Leave History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="space-y-4 mt-4">
                  {recentLeaves.map((leave, index) => (
                    <li key={index} className="flex justify-between items-start border-b pb-3">
                      <div>
                        <p className="font-semibold text-pink-600 leading-tight">
                          {leave.userId?.firstName} {leave.userId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{leave.leaveTypeId?.name}</p>
                      </div>
                      <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-md whitespace-nowrap">
                        {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

        </motion.div>
      </main>
    </div>
  )
}
