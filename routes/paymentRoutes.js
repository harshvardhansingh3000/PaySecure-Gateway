import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addPaymentMethod,getPaymentMethods } from '../controllers/paymentController.js';
import { removePaymentMethod,initiatePayment } from '../controllers/paymentController.js';
import { getTransactionHistory, refundPayment } from '../controllers/paymentController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/add',
  [
    body('type').isIn(['card', 'upi']).withMessage('Type must be card or upi'),
    body('details').notEmpty().withMessage('Payment details required')
  ],
  authMiddleware,
  addPaymentMethod
);

router.post(
  '/pay',
  [
    body('paymentMethodId').isInt().withMessage('Payment method ID must be an integer'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('description').optional().isString()
  ],
  authMiddleware,
  initiatePayment
);
router.get('/list', authMiddleware, getPaymentMethods);
router.delete('/remove/:id', authMiddleware, removePaymentMethod);
router.get('/history', authMiddleware, getTransactionHistory);
router.post('/refund/:transactionId', authMiddleware, refundPayment);

export default router;