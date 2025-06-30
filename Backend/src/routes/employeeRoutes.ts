import express from 'express';
import {
  submitLeaveRequest,
  getLeaveBalance,
  getTotalPendingLeaveDays,
  createEmployee,
  getEmployees,
  updateEmployee,
  getEmployeeSummary,
  getLeaveHistory,
  getLoggedInEmployee,
  getUpcomingHolidays,
  getEmployeeScore
} from '../controllers/employeeControllers';
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/create', createEmployee);
router.get('/', getEmployees);
router.get('/summary', getEmployeeSummary);
router.put('/:employeeId', updateEmployee);

router.post('/leave-requests', authenticateUser, submitLeaveRequest);
router.get('/history', authenticateUser, getLeaveHistory);
router.get('/leave-balance',authenticateUser, getLeaveBalance);
router.get('/pending-leaves-days', authenticateUser, getTotalPendingLeaveDays);
router.get('/me', authenticateUser, getLoggedInEmployee);
router.get('/upcoming-holidays', authenticateUser, getUpcomingHolidays);
router.get('/score', authenticateUser, getEmployeeScore);

export default router;
