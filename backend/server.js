import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from "./config/database.js";
import postRoutes from "./routes/postRoutes.js"
import authRouter from './routes/authRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5006;

connectDB();

app.use(express.json());

app.use (cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));

app.use((req, res, next) => {
    console.log('Request body before route:',req.body);
    next();
});

//api routes
app.get('/', (req, res) => {
    res.send('Hello, from Server')
})
app.get('/api/posts', postRoutes);
app.use('/api/auth', authRouter);


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
