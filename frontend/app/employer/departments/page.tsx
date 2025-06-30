'use client'

import React, { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { LayoutDashboard, Users, Building, Clock, History, BarChart, Trash2, Pencil, Plus, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface Department {
  _id: string
  name: string
  managerId: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null
}

type Manager = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
]

export default function EmployerDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [name, setName] = useState('');
  const [managerId, setManagerId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managerName, setManagerName] = useState('');
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const router = useRouter();

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error('Fetch departments error:', err);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/managers`)
      setManagers(res.data);
    } catch (err) {
      console.error('Fetch managers error:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/departments/${editingId}`, { name, managerId });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/departments`, { name, managerId });
        setError('');
      }
      setName('');
      setManagerId('');
      setEditingId(null);
      setShowForm(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unknown error');
    }
  };

  const handleEdit = (dept: Department) => {
    setName(dept.name);
    setManagerId(dept.managerId?._id || '');
    setEditingId(dept._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleCreateManager = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/managers`, {
        name: managerName,
        email: managerEmail,
        password: managerPassword,
      });
      setManagerName('');
      setManagerEmail('');
      setManagerPassword('');
      setShowManagerForm(false);
      setError('');
      fetchManagers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating manager');
    }
  };

  
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
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-6 text-slate-800">Departments</h1>

          <div className="flex space-x-4 mb-6">
          <Button
  onClick={() => {
    setShowForm(!showForm);
    setError('');
  }}
>
  {showForm ? '✖ Close Form' : (
    <>
      <Plus className="w-4 h-4 mr-1" /> Add Department
    </>
  )}
</Button>

<Button
  onClick={() => {
    setShowManagerForm(!showManagerForm);
    setError('');
  }}
  variant="secondary"
>
  {showManagerForm ? '✖ Close Manager Form' : (
    <>
      <UserPlus className="w-4 h-4 mr-1" /> Add Manager
    </>
  )}
</Button>
          </div>

          {showManagerForm && (
            <form onSubmit={handleCreateManager} className="mb-8 bg-white p-4 rounded-lg shadow space-y-4">
              <h2 className="text-xl font-semibold text-slate-700">Create Manager</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <Input value={managerName} onChange={(e) => setManagerName(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <Input type="email" value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Input type="password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} required />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button type="submit">Create Manager</Button>
            </form>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded-lg shadow space-y-4">
              <h2 className="text-xl font-semibold text-slate-700">{editingId ? 'Edit' : 'Add'} Department</h2>

              <div>
                <label className="block text-sm font-medium text-slate-700">Department Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full border border-slate-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400"
                  required
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager._id} value={manager._id}>
                      {manager.firstName} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-500">{error}</p>}

              <Button type="submit">{editingId ? 'Update' : 'Create'} Department</Button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 rounded-xl">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-xl">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center text-lg font-semibold">
                        <Building className="mr-2" /> {dept.name}
                      </div>
                      <div className="flex space-x-3">
                        <Pencil className="cursor-pointer hover:text-yellow-300" onClick={() => handleEdit(dept)} />
                        <Trash2 className="cursor-pointer hover:text-red-300" onClick={() => handleDelete(dept._id)} />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 text-slate-600 text-sm">
                    <p>
                      <span className="font-medium text-slate-700">Manager:</span>{' '}
                      {dept.managerId ? (
                        <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                          {dept.managerId.firstName} {dept.managerId.lastName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
