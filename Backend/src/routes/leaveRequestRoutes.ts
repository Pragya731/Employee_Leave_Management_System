import express from 'express';
import {
  getPendingLeaveRequests,
  updateLeaveRequestStatus,
  getAllLeaveRequests,
  getRecentLeaveHistory
} from '../controllers/leaveRequestController';
import { authenticateUser } from '../middlewares/authMiddleware'

const router = express.Router();

router.get('/pending', getPendingLeaveRequests); // Employer: fetch all pending
router.patch('/:id/status', authenticateUser, updateLeaveRequestStatus); // Employer: approve/reject
router.get('/', getAllLeaveRequests);
router.get('/leave-history/recent', getRecentLeaveHistory);

export default router;
