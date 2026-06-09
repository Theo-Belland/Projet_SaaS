import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/Auth.js';
import adminRoutes from './routes/Admin.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Mongo Connecte'))
.catch((err) => console.log(err));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});