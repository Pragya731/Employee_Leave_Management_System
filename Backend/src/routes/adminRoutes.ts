import express from 'express';
import { createLeaveType, getAllLeaveTypes } from '../controllers/adminController';
const router = express.Router();

router.post('/leave-types', createLeaveType);
router.get('/leave-types', getAllLeaveTypes);

export default router;