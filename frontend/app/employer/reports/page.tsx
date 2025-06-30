 'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Users, Building, Clock, History, BarChart, PieChart, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
]

export default function EmployerReports() {
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

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
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Reports</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="flex items-center">
                  <PieChart className="mr-2" /> Leave Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-slate-500">Pie chart placeholder</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2" /> Leave Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-slate-500">Line chart placeholder</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle className="flex items-center">
                  <BarChart className="mr-2" /> Department-wise Leave Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64 flex items-center justify-center">
                <p className="text-slate-500">Bar chart placeholder</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}


