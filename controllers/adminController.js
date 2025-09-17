import pool from '../models/db.js';

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users');
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const txResult = await pool.query('SELECT COUNT(*) AS total, SUM(amount) AS total_amount FROM transactions WHERE status = $1', ['success']);
    const failResult = await pool.query('SELECT COUNT(*) AS failed FROM transactions WHERE status = $1', ['failed']);
    const userResult = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const topUsers = await pool.query('SELECT user_id, COUNT(*) AS tx_count FROM transactions GROUP BY user_id ORDER BY tx_count DESC LIMIT 5');

    res.json({
      totalPayments: txResult.rows[0].total,
      totalAmountProcessed: txResult.rows[0].total_amount,
      totalFailed: failResult.rows[0].failed,
      totalUsers: userResult.rows[0].total_users,
      topUsers: topUsers.rows
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};