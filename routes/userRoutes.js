import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], registerUser);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], loginUser);
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'User profile fetched successfully',
    user: req.user
  });
});

export default router;
