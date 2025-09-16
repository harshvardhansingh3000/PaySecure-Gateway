import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addPaymentMethod,getPaymentMethods } from '../controllers/paymentController.js';
import { removePaymentMethod,initiatePayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/add', authMiddleware, addPaymentMethod);
router.get('/list', authMiddleware, getPaymentMethods);
router.delete('/remove/:id', authMiddleware, removePaymentMethod);
router.post('/pay', authMiddleware, initiatePayment);

export default router;