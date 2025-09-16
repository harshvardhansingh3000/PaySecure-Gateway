import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addPaymentMethod } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/add', authMiddleware, addPaymentMethod);

export default router;