import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employeeRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

app.use('/api/employee', employeeRoutes);
app.use('/api/users', userRoutes);

app.listen(7000, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

export default app;
