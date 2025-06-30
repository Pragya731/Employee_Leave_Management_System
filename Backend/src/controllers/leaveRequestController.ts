import { Request, Response } from 'express';
import LeaveRequest from '../models/LeaveRequest';
import mongoose from 'mongoose';
import LeaveBalance from '../models/LeaveBalance';

// Employer: Get all pending leave requests
export const getPendingLeaveRequests = async (req: Request, res: Response) => {
    try {
      const pendingRequests = await LeaveRequest.find({ status: 'pending' })
      .populate({
        path: 'userId',
        select: 'firstName lastName email departmentId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      })
      .populate('leaveTypeId', 'name'); 

      res.status(200).json(pendingRequests);
    } catch (err) {
      console.error("🔥 Error fetching leave requests:", err);
      res.status(500).json({ message: 'Failed to fetch leave requests' });
    }
  };


export const updateLeaveRequestStatus = async (req: Request, res: Response) => {
  console.log('📥 Request Body:', req.body);
  console.log('📥 Request Params:', req.params);
  console.log('👤 Authenticated User:', (req as any).user);

  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  const approvedBy = (req as any).user?.id;

  try {
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid leave request ID' });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({
        message: 'Rejection reason is required when rejecting a leave request.',
      });
    }

    if (status === 'approved' && !approvedBy) {
      return res.status(400).json({ message: 'Approver information missing from token.' });
    }

    // Calculate duration
    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const diffInMs = Math.abs(end.getTime() - start.getTime());
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    // Set common fields
    leaveRequest.status = status;
    leaveRequest.decisionDate = new Date();
    leaveRequest.durationInDays = diffInDays;

    if (status === 'rejected') {
      leaveRequest.rejectionReason = rejectionReason;
      leaveRequest.approvedBy = undefined;
    }

    if (status === 'approved') {
      leaveRequest.approvedBy = approvedBy;
      leaveRequest.rejectionReason = undefined;

      // Decrement leave balance
      const leaveBalance = await LeaveBalance.findOne({
        userId: leaveRequest.userId,
        leaveTypeId: leaveRequest.leaveTypeId,
      });

      if (!leaveBalance) {
        return res.status(404).json({ message: 'Leave balance record not found' });
      }

      if (leaveBalance.balance < diffInDays) {
        return res.status(400).json({
          message: `Insufficient leave balance. Available: ${leaveBalance.balance}, Required: ${diffInDays}`,
        });
      }

      leaveBalance.balance -= diffInDays;
      await leaveBalance.save();

    }

    await leaveRequest.save();

    const populatedLeave = await LeaveRequest.findById(leaveRequest._id)
      .populate('userId', 'firstName lastName email')
      .populate('leaveTypeId', 'name');

    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leaveRequest: populatedLeave,
    });
  } catch (err) {
    console.error('❌ Error updating leave request status:', err);
    res.status(500).json({ message: 'Failed to update leave request' });
  }
};
  
  
  
// Get all leave requests (for history)
export const getAllLeaveRequests = async (req: Request, res: Response) => {
  try {
    const allRequests = await LeaveRequest.find()
      .sort({ startDate: -1 }) // optional: newest first
      .populate({
        path: 'userId',
        select: 'firstName lastName email departmentId',
        populate: {
          path: 'departmentId',
          select: 'name',
        },
      })
      .populate('leaveTypeId', 'name');

    res.status(200).json(allRequests);
  } catch (err) {
    console.error("🔥 Error fetching all leave requests:", err);
    res.status(500).json({ message: 'Failed to fetch all leave requests' });
  }
};
export const getRecentLeaveHistory = async (req: Request, res: Response) => {
  try {
    const recentHistory = await LeaveRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName')
      .populate('leaveTypeId', 'name');

    res.status(200).json(recentHistory);
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
