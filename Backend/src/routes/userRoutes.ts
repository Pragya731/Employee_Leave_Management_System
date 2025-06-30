import express from 'express';
import { loginUser, getManagers, createManager } from '../controllers/UserController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/managers', createManager);
router.get('/managers', getManagers);

export default router;
