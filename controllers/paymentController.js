import pool from '../models/db.js';
import CryptoJS from 'crypto-js';

export const addPaymentMethod = async (req, res) => {
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