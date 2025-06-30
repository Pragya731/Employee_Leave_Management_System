'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Star, Calendar, Clock, History } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employee/home' },
  { icon: Star, label: 'Score', href: '/employee/score' },
  { icon: Calendar, label: 'Available Leaves', href: '/employee/pending-leaves' },
  { icon: Clock, label: 'Leave Request', href: '/employee/leave-request' },
  { icon: History, label: 'Total Leave History', href: '/employee/leave-history' },
]

// Function to decode JWT token and extract user ID
const getUserIdFromToken = (token: string) => {
  try {
    if (!token) return null
    const payload = token.split('.')[1]
    const decodedPayload = JSON.parse(atob(payload))
    return decodedPayload.id
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

export default function EmployeeLeaveRequest() {
  const [userId, setUserId] = useState(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()
  const [leaveType, setLeaveType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("No token found. Redirecting to login.")
      router.push('/login')
      return
    }

    const id = getUserIdFromToken(token)
    if (id) {
      setUserId(id)
      localStorage.setItem('userId', id)
    } else {
      toast.error("Invalid token. Redirecting to login.")
      router.push('/login')
    }
  }, [router])

  //const handleLogout = () => {
  //  localStorage.removeItem('token')
  //  localStorage.removeItem('userId')
  //  router.push('/login')
  //}
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsSubmitting(true)

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Authentication token not found. Please login again.')
      setIsSubmitting(false)
      router.push('/login')
      return
    }

    const currentUserId = userId || getUserIdFromToken(token)

    if (!currentUserId) {
      toast.error('User ID not found. Please login again.')
      setIsSubmitting(false)
      router.push('/login')
      return
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      toast.error('All fields are required.')
      setIsSubmitting(false)
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date cannot be after end date.')
      setIsSubmitting(false)
      return
    }

    const leaveData = {
      leaveType,
      startDate,
      endDate,
      reason,
      userId: currentUserId
    }

    console.log('Submitting leave data:', leaveData)

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/leave-requests`, leaveData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.status === 200 || res.status === 201) {
        toast.success(res.data.message || 'Leave request submitted successfully!')
        setLeaveType('')
        setStartDate('')
        setEndDate('')
        setReason('')
      }
    } catch (error) {
      console.error('Error submitting leave request:', error)

      if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || 'Failed to submit leave request.'
        toast.error(msg)
      } else {
        toast.error('An unexpected error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
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
        <ToastContainer position="top-right" autoClose={4000} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Submit Leave Request</h1>
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center">
                <Clock className="mr-2" /> New Leave Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="leave-type">Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType} required>
                    <SelectTrigger id="leave-type">
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    id="start-date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    min="2000-01-01"
                    onChange={(e) => setEndDate(e.target.value)}
                    id="end-date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                    rows={4}
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
