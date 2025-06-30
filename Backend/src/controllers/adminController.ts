// src/controllers/adminControllers.ts

import { Request, Response } from 'express';
import LeaveType from '../models/LeaveType';

// Create a new leave type
export const createLeaveType = async (req: Request, res: Response) => {
  try {
    const { name, description, allowedDays, requiresApproval } = req.body;

    // Check if leave type already exists
    const existingLeaveType = await LeaveType.findOne({ name });
    if (existingLeaveType) {
      return res.status(400).json({ 
        success: false, 
        message: `Leave type '${name}' already exists` 
      });
    }

    // Create new leave type
    const newLeaveType = new LeaveType({
      name,
      description,
      allowedDays,
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true
    });

    await newLeaveType.save();

    res.status(201).json({
      success: true,
      message: 'Leave type created successfully',
      leaveType: newLeaveType
    });
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating leave type',
      error: error
    });
  }
};

// Get all leave types
export const getAllLeaveTypes = async (req: Request, res: Response) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: leaveTypes.length,
      leaveTypes
    });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave types',
      error: error
    });
  }
};