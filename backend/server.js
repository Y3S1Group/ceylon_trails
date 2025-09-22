import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./config/database.js";
import postRoutes from "./routes/postRoutes.js"
import authRouter from './routes/authRoutes.js';
import savedRoutes from './routes/savedRoutes.js';
import adminRouter from './routes/adminRoute.js'
import reportRouter from './routes/reportRoutes.js'
import { cloudinaryErrorHandler, cloudinaryTestHandler, validateCloudinaryOnStartup } from './config/cloudinary.js';
import { handleFileUpload } from './middleware/fileUpload.js';
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5006;

connectDB();

app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use (cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());
app.use((req, res, next) => {
    console.log('Request body before route:',req.body);
    next();
});

//api routes
app.get('/', (req, res) => {
    res.send('Hello, from Server')
})

app.use('/api/auth', authRouter);
app.use('/api/saved', savedRoutes);
app.use('/api/admin', adminRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/reports", reportRouter);
app.get('/api/test/cloudinary', cloudinaryTestHandler);
app.use('/api/posts', (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        handleFileUpload(req, res, next);
    } else {
        next();
    }
}, postRoutes);

app.use(cloudinaryErrorHandler);

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
    validateCloudinaryOnStartup();
})
