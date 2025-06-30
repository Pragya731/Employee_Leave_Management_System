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
  Activity,
  BarChartHorizontalBig
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Progress } from "@/components/ui/progress"
import axios from 'axios'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee/home' },
  { icon: Star, label: 'Score', href: '/employee/score' },
  { icon: Calendar, label: 'Available Leaves', href: '/employee/pending-leaves' },
  { icon: Clock, label: 'Leave Request', href: '/employee/leave-request' },
  { icon: History, label: 'Total Leave History', href: '/employee/leave-history' },
]

interface PerformanceData {
  overallScore: number
  attendanceDiscipline: number
  attendancePresence: number
  timelyRequests: number
  pendingRequests: number
  overlapHandling: number
  tenureBonus: number
  breakdown?: {
    disciplineScore: string
    presenceScore: string
    timelyScore: string
    pendingScore: string
    overlapScore: string
    tenureScore: string
  }
  debug?: Record<string, any>
}

export default function EmployeeScore() {
  const [isMinimized, setIsMinimized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [debugMode, setDebugMode] = useState(false)
  const router = useRouter()

  //const handleLogout = () => {
  //  localStorage.clear()
  //  router.push('/login')
  //}
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const userId = localStorage.getItem('userId')
        const token = localStorage.getItem('token')

        if (!userId || !token) {
          router.push('/login')
          return
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/score?debug=${debugMode}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        setPerformance(res.data)
      } catch (err: any) {
        setError('Failed to load performance data.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [router, debugMode])

  return (
    <div className="flex h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
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
          className="max-w-6xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-slate-800">Performance Score</h1>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={debugMode}
                onChange={() => setDebugMode(!debugMode)}
                className="form-checkbox"
              />
              <span className="text-sm text-slate-600">Show Debug Info</span>
            </label>
          </div>

          {loading ? (
            <p className="text-slate-600 text-lg">Loading performance data...</p>
          ) : error ? (
            <p className="text-red-600 text-lg">{error}</p>
          ) : performance ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Score Card */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center">
                    <Star className="mr-2" /> Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Overall score is already out of 100 from backend, so no multiply */}
                  <p className="text-6xl font-bold text-orange-600">{performance.overallScore.toFixed(0)}</p>
                  <p className="text-xl text-slate-600 mt-2">Out of 100</p>
                  <Progress value={performance.overallScore} className="mt-4" />
                </CardContent>
              </Card>

              {/* Performance Breakdown Metrics */}
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2" /> Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4 text-slate-700 text-base">
                    <li className="flex justify-between items-center">
                      <span>Leave Discipline</span>
                      <span className="font-bold">{performance.attendanceDiscipline.toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Presence Score</span>
                      <span className="font-bold">{performance.attendancePresence.toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Timely Requests</span>
                      <span className="font-bold">{performance.timelyRequests.toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Pending Requests</span>
                      <span className="font-bold">{performance.pendingRequests.toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Overlap Handling</span>
                      <span className="font-bold">{performance.overlapHandling.toFixed(0)}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Tenure Bonus</span>
                      <span className="font-bold">{performance.tenureBonus.toFixed(0)}%</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              {performance.breakdown && (
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2">
                  <CardHeader className="bg-gradient-to-r from-lime-600 to-lime-400 text-white">
                    <CardTitle className="flex items-center">
                      <BarChartHorizontalBig className="mr-2" /> Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-slate-700 text-base">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <li className="flex justify-between">
                        <span>Discipline Score</span>
                        <span className="font-mono">{performance.breakdown.disciplineScore}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Presence Score</span>
                        <span className="font-mono">{performance.breakdown.presenceScore}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Timely Request Score</span>
                        <span className="font-mono">{performance.breakdown.timelyScore}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Pending Score</span>
                        <span className="font-mono">{performance.breakdown.pendingScore}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Overlap Score</span>
                        <span className="font-mono">{performance.breakdown.overlapScore}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Tenure Bonus</span>
                        <span className="font-mono">{performance.breakdown.tenureScore}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Debug Info */}
              {debugMode && performance.debug && (
                <Card className="bg-white shadow-md md:col-span-2">
                  <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-500 text-white">
                    <CardTitle className="flex items-center">
                      <Activity className="mr-2" /> Debug Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="text-sm text-slate-800 space-y-2">
                      {Object.entries(performance.debug).map(([key, value]) => (
                        <li key={key} className="flex justify-between border-b border-slate-100 py-1">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-mono">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <p className="text-slate-600">No performance data found.</p>
          )}
        </motion.div>
      </main>
    </div>
  )
}
