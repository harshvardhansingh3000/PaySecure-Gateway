import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'User profile fetched successfully',
    user: req.user
  });
});

export default router;
