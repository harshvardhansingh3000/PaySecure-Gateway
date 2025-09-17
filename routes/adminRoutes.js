import express from 'express';
import { getAllUsers, getSystemStats } from '../controllers/adminController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/stats', authMiddleware, adminMiddleware, getSystemStats);

export default router;