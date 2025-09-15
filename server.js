import express from 'express';
const app = express();
import userRoutes from './routes/userRoutes.js';


const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send("Welcome to PaySecure Gateway");
});

app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
