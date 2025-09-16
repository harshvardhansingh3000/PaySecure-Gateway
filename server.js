import express from 'express';
const app = express();
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send("Welcome to PaySecure Gateway");
});

app.use('/api/users', userRoutes);

app.use('/api/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
