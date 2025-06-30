import { Request, Response } from 'express';
import Department from '../models/Department';
import mongoose from 'mongoose';
import User from '../models/User';  // Assuming the User model is imported here

// Fetch departments with populated managerId and error handling for broken references
export const getDepartments = async (req: Request, res: Response) => {
  try {
    // Fetch departments and populate managerId
    const departmentsRaw = await Department.find().populate({
      path: 'managerId',
      select: 'firstName lastName email',
      strictPopulate: false // Prevent error if ref is broken
    });

    // Filter out departments with broken manager references (null or missing managers)
    const departments = departmentsRaw.filter(dept => dept.managerId !== null);

    res.status(200).json(departments);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Get Departments Error:', error.message);  // Enhanced error logging
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};

// Create a new department, handling invalid managerId
export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, managerId } = req.body;

    // Validate input
    if (!name || !managerId) {
      return res.status(400).json({ message: 'Name and managerId are required' });
    }

    // Check if managerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(managerId)) {
      return res.status(400).json({ message: 'Invalid managerId format' });
    }

    // Check if the manager exists
    const managerExists = await User.exists({ _id: managerId });
    if (!managerExists) {
      return res.status(400).json({ message: 'Manager does not exist' });
    }

    // Check if the department already exists
    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    // Create and save the new department
    const department = new Department({ name, managerId });
    await department.save();

    res.status(201).json(department);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Create Department Error:', error.message);  // Enhanced error logging
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'An unknown error occurred' });
  }
};
