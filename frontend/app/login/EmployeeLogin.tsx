import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { User, Lock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from "axios";

export default function EmployeeLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        email,
        password,
        role : 'employee'
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);

  
      console.log(response.data);

      router.push('/employee/home')
    } catch (error:unknown) {

      alert("Login Error")
      console.error("Login error:", error || error);
    }
  };

  return (
    <motion.form
      onSubmit={handleForm}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <motion.h2
        className="text-3xl font-bold text-gray-800 mb-6"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        Employee Login
      </motion.h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee-email" className="text-sm font-medium text-gray-700">Email</Label>
          <div className="relative">
            <Input
              id="employee-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-password" className="text-sm font-medium text-gray-700">Password</Label>
          <div className="relative">
            <Input
              id="employee-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 py-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-300 flex items-center justify-center">
        Login <ArrowRight className="ml-2" size={18} />
      </Button>
      <div className="text-center">
        <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
      </div>
    </motion.form>
  )
}

