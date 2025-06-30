'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
  LayoutDashboard,
  Users,
  Building,
  Clock,
  History,
  BarChart,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  leaveBalance: number;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/employer/home' },
  { icon: Users, label: 'Employees', href: '/employer/employees' },
  { icon: Building, label: 'Departments', href: '/employer/departments' },
  { icon: Clock, label: 'Leave Requests', href: '/employer/leave-requests' },
  { icon: History, label: 'Leave History', href: '/employer/leave-history' },
  { icon: BarChart, label: 'Reports', href: '/employer/reports' },
];

export default function EmployerEmployees() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortField, setSortField] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [defaultLeavePolicy, setDefaultLeavePolicy] = useState({
    casual: 5,
    sick: 5,
    earned: 10,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee`);
        if (res.ok) {
          const data = await res.json();
          setEmployees(data);
        } else {
          console.error('Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    const { name, email, department, position } = newEmployee;
    if (!name || !email || !department || !position) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      const data = await res.json();

      if (res.ok) {
        setEmployees([...employees, data.employee]);
        setShowModal(false);
        setNewEmployee({ name: '', email: '', department: '', position: '' });
      } else {
        alert(`Failed to add employee: ${data?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;

    const { _id, name, email, department, position } = selectedEmployee;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/employee/${_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department, position }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEmployees((prev) =>
          prev.map((emp) => (emp._id === updated._id ? updated : emp))
        );
        setShowModal(false);
        setSelectedEmployee(null);
      } else {
        alert('Update failed');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const handleUpdatePolicy = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leave-policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultLeavePolicy),
    });
    setShowPolicyModal(false);
    alert('Default leave policy updated!');
  };

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedEmployees = filteredEmployees.sort((a, b) => {
    const aVal = a[sortField as keyof Employee];
    const bVal = b[sortField as keyof Employee];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const openViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditMode(false);
    setShowModal(true);
  };

  const openEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditMode(true);
    setShowModal(true);
  };

  
  const handleLogout = () => {
  localStorage.removeItem('token')
  window.location.href = 'http://localhost:3000/'
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
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
          <h1 className="text-4xl font-bold mb-8 text-slate-800">Employee Management</h1>

          <div className="flex gap-4 mb-6">
            <Button onClick={() => {
              setShowModal(true);
              setSelectedEmployee(null);
              setIsEditMode(false);
            }}>
              + Add New Employee
            </Button>
            <Button variant="outline" onClick={() => setShowPolicyModal(true)}>
              Set Default Leave Policy
            </Button>
          </div>

          <Card className="bg-white shadow-md">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="flex justify-between items-center">
                <span><Users className="inline mr-2" /> Employees</span>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-8"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="w-full text-left mt-4">
                  <thead>
                    <tr>
                      <th onClick={() => handleSortChange('name')} className="cursor-pointer">Name</th>
                      <th onClick={() => handleSortChange('department')} className="cursor-pointer">Department</th>
                      <th onClick={() => handleSortChange('position')} className="cursor-pointer">Position</th>
                      <th onClick={() => handleSortChange('leaveBalance')} className="cursor-pointer">Leave Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedEmployees.map((emp) => (
                      <tr key={emp._id}>
                        <td>{emp.name}</td>
                        <td>{emp.department}</td>
                        <td>{emp.position}</td>
                        <td>{emp.leaveBalance}</td>
                        <td>
                          <Button size="sm" onClick={() => openViewDetails(emp)}>View</Button>
                          <Button size="sm" className="ml-2" onClick={() => openEditEmployee(emp)}>Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Employee Modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">
                  {isEditMode ? 'Edit Employee' : selectedEmployee ? 'Employee Details' : 'Add Employee'}
                </h2>

                {!isEditMode && selectedEmployee ? (
                  <div>
                    <p><strong>Name:</strong> {selectedEmployee.name}</p>
                    <p><strong>Email:</strong> {selectedEmployee.email}</p>
                    <p><strong>Department:</strong> {selectedEmployee.department}</p>
                    <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  </div>
                ) : (
                  <>
                    <Label>Name</Label>
                    <Input
                      value={isEditMode ? selectedEmployee?.name || '' : newEmployee.name}
                      onChange={(e) =>
                        isEditMode
                          ? setSelectedEmployee((prev) => prev && { ...prev, name: e.target.value })
                          : setNewEmployee({ ...newEmployee, name: e.target.value })
                      }
                    />
                    <Label>Email</Label>
                    <Input
                      value={isEditMode ? selectedEmployee?.email || '' : newEmployee.email}
                      onChange={(e) =>
                        isEditMode
                          ? setSelectedEmployee((prev) => prev && { ...prev, email: e.target.value })
                          : setNewEmployee({ ...newEmployee, email: e.target.value })
                      }
                    />
                    <Label>Department</Label>
                    <Input
                      value={isEditMode ? selectedEmployee?.department || '' : newEmployee.department}
                      onChange={(e) =>
                        isEditMode
                          ? setSelectedEmployee((prev) => prev && { ...prev, department: e.target.value })
                          : setNewEmployee({ ...newEmployee, department: e.target.value })
                      }
                    />
                    <Label>Position</Label>
                    <Input
                      value={isEditMode ? selectedEmployee?.position || '' : newEmployee.position}
                      onChange={(e) =>
                        isEditMode
                          ? setSelectedEmployee((prev) => prev && { ...prev, position: e.target.value })
                          : setNewEmployee({ ...newEmployee, position: e.target.value })
                      }
                    />
                  </>
                )}

                <div className="flex justify-end mt-6 space-x-2">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  {!selectedEmployee || isEditMode ? (
                    <Button onClick={isEditMode ? handleUpdateEmployee : handleAddEmployee}>
                      {isEditMode ? 'Update' : 'Add'}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Leave Policy Modal */}
          {showPolicyModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                <h2 className="text-xl font-bold mb-4">Set Default Leave Policy</h2>

                {['casual', 'sick', 'earned'].map((type) => (
                  <div key={type} className="mb-4">
                    <Label className="capitalize">{type} Leave</Label>
                    <Input
                      type="number"
                      value={defaultLeavePolicy[type as keyof typeof defaultLeavePolicy]}
                      onChange={(e) =>
                        setDefaultLeavePolicy({
                          ...defaultLeavePolicy,
                          [type]: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                ))}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPolicyModal(false)}>Cancel</Button>
                  <Button onClick={handleUpdatePolicy}>Update</Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
