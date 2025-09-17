import express from 'express';
import { register, login, logout, sendVerifyOtp, verifyEmail, getCurrentUser, adminRegister} from '../controllers/authController.js';
import { getUserPosts } from '../controllers/postController.js'
import userAuth from '../middleware/userauth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/get-current-user', userAuth, getCurrentUser);
authRouter.get('/:userId/posts', getUserPosts);
authRouter.post('/admin-register', adminRegister);


export default authRouter;