import express from 'express';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

app.use(morgan('combined')); // Logs all requests in Apache combined format

app.get('/', (req, res) => {
  res.send("Welcome to PaySecure Gateway");
});

app.use('/api/users', userRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
