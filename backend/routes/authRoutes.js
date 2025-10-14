import express from 'express';
import multer from 'multer';
import { 
    register, 
    login, 
    logout, 
    sendVerifyOtp, 
    verifyEmail, 
    getCurrentUser,
    updateProfile,
    deleteProfile,
    adminRegister,              
    uploadProfileImage,         
    uploadBackgroundImage,      
    deleteProfileImage,         
    deleteBackgroundImage,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPassword
} from '../controllers/authController.js';
import { getUserPosts } from '../controllers/postController.js';
import userAuth from '../middleware/userauth.js';

const authRouter = express.Router();

// Configure multer for memory storage (same as your posts)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/get-current-user', userAuth, getCurrentUser);
authRouter.get('/:userId/posts', getUserPosts);
authRouter.post('/admin-register', adminRegister);

// Profile management routes
authRouter.put('/update-profile', userAuth, updateProfile);
authRouter.delete('/delete-profile', userAuth, deleteProfile);

// Profile image routes
authRouter.post('/upload-profile-image', userAuth, upload.single('image'), uploadProfileImage);
authRouter.post('/upload-background-image', userAuth, upload.single('image'), uploadBackgroundImage);
authRouter.delete('/delete-profile-image', userAuth, deleteProfileImage);
authRouter.delete('/delete-background-image', userAuth, deleteBackgroundImage);

// Forgot Password routes (NO authentication needed)
authRouter.post('/forgot-password/send-otp', sendForgotPasswordOtp);
authRouter.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
authRouter.post('/forgot-password/reset', resetPassword);

export default authRouter;