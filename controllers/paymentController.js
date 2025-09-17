import pool from '../models/db.js';
import CryptoJS from 'crypto-js';
import { validationResult } from 'express-validator';

export const addPaymentMethod = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    const { type, details } = req.body;
    const userId = req.user.userId;

    // Encrypt payment details
    const encryptedDetails = CryptoJS.AES.encrypt(details, process.env.PAYMENT_ENCRYPTION_KEY).toString();
    try {
        const result = await pool.query(
        'INSERT INTO payment_methods (user_id, type, details) VALUES ($1, $2, $3) RETURNING id, type, is_active, created_at',
        [userId, type, encryptedDetails]
        );
        res.status(201).json({
        message: 'Payment method added successfully',
        paymentMethod: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getPaymentMethods = async (req, res) => {
  const userId = req.user.userId; // assuming authMiddleware sets req.user
  try {
    const result = await pool.query(
      'SELECT id, type, details, is_active, created_at FROM payment_methods WHERE user_id = $1',
      [userId]
    );
    // Decrypt details before sending
    const paymentMethods = result.rows.map(pm => ({
      ...pm, // copy all original fields
      details: CryptoJS.AES.decrypt(pm.details, process.env.PAYMENT_ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) // overwrite 'details' with decrypted text
    }));
    res.json({ paymentMethods });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const removePaymentMethod = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params; // payment method id

  try {
    // Only delete if payment method belongs to the user
    const result = await pool.query(
      'DELETE FROM payment_methods WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Payment method not found or not authorized' });
    }
    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const initiatePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
    const userId = req.user.userId;
    const { paymentMethodId, amount, description } = req.body;
    try{
    // Check if payment method belongs to user
    const pmResult = await pool.query(
        'SELECT id FROM payment_methods WHERE id = $1 AND user_id = $2 AND is_active = true',
        [paymentMethodId, userId]
    );
    if (pmResult.rowCount === 0) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    // Simulate payment processing (in real world, integrate with payment processor)

    let status = 'pending';
    let failureReason = null;

    // Example simulation logic
    if (amount > 10000) {
      status = 'failed';
      failureReason = 'Amount exceeds transaction limit';
    } else if (Math.random() < 0.1) {
      status = 'failed';
      failureReason = 'Network error';
    } else if (Math.random() < 0.2) {
      status = 'pending';
    } else {
      status = 'success';
    }

    // Record transaction
    const txResult = await pool.query(
      'INSERT INTO transactions (user_id, payment_method_id, amount, status, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, paymentMethodId, amount, status, description]
    );

    res.status(201).json({
      message: status === 'success' ? 'Payment processed successfully' : 'Payment not successful',
      transaction: { ...txResult.rows[0], failureReason }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT t.id, t.amount, t.status, t.description, t.created_at, 
              pm.type AS payment_method_type
         FROM transactions t
         LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC`,
      [userId]
    );
    res.json({ transactions: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const refundPayment = async (req, res) => {
  const userId = req.user.userId;
  const { transactionId } = req.params;

  try {
    // Find transaction and check ownership/status
    const txResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [transactionId, userId]
    );
    if (txResult.rowCount === 0) {
      return res.status(404).json({ message: 'Transaction not found or not authorized' });
    }
    const transaction = txResult.rows[0];
    if (transaction.status !== 'success') {
      return res.status(400).json({ message: 'Only successful transactions can be refunded' });
    }

    // Simulate refund (update status)
    await pool.query(
      'UPDATE transactions SET status = $1 WHERE id = $2',
      ['refunded', transactionId]
    );

    res.json({ message: 'Refund processed', transactionId });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};