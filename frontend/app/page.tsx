'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EmployeeLogin from './login/EmployeeLogin'
import EmployerLogin from './login/EmployerLogin'
import { Building2, Users } from 'lucide-react'

export default function LoginPage() {
  const [isEmployee, setIsEmployee] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col justify-center">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-3xl font-bold mb-4"
              >
                Welcome to ELM System
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-lg mb-6"
              >
                Manage your leaves efficiently with our state-of-the-art Employee Leave Management System.
              </motion.p>
              <div className="flex space-x-4">
                <Button 
                  variant={isEmployee ? "secondary" : "ghost"} 
                  className="flex-1 py-6" 
                  onClick={() => setIsEmployee(true)}
                >
                  <Users className="mr-2" />
                  Employee
                </Button>
                <Button
                  variant={!isEmployee ? "secondary" : "ghost"}
                  className="flex-1 py-6"
                  onClick={() => setIsEmployee(false)}
                >
                  <Building2 className="mr-2" />
                  Employer
                </Button>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8">
              <AnimatePresence mode="wait">
                {isEmployee ? (
                  <motion.div
                    key="employee"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmployeeLogin />
                  </motion.div>
                ) : (
                  <motion.div
                    key="employer"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EmployerLogin />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
