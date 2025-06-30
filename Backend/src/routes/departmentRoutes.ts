import express from 'express';
import { getDepartments, createDepartment } from '../controllers/departmentController';

const router = express.Router();

router.get('/', getDepartments);
router.post('/', createDepartment);

export default router;
