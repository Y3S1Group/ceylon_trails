import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userModel from '../models/userModel.js';
import { text } from 'express';
import transporter from '../config/nodemailer.js';


export const register = async (req, res) => {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.json({success: false, message: 'Missing Details'})
    }

    try{

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success: false, message: 'User already exists'});
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new userModel({name,email, password: passwordHash});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {httpOnly: true, 
                                    secure: process.env.NODE_ENV === 'production', 
                                    sameSite: process.env.NODE_ENV === 'production' ? 
                                    'none' : 'strict',
                                    maxAge: 7 * 24 * 60 * 60 * 1000

        });

        //sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to:email,
            subject: 'Welcome to our service',
            text: `Hello ${name},\n\nThank you for registering with us. We are excited to have you on board!\n\nBest regards,\nYour Service Team`
        }

        await transporter.sendMail(mailOptions);

        return res.json({success: true});


    } catch(error) {
        res.json({success: false, message: error.message});
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.json({success: false, message: 'Email and Password are required'});
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.json({success: false, message: 'Invalid email or password'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        res.cookie('token', token, {httpOnly: true, 
                                    secure: process.env.NODE_ENV === 'production', 
                                    sameSite: process.env.NODE_ENV === 'production' ? 
                                    'none' : 'strict',
                                    maxAge: 7 * 24 * 60 * 60 * 1000

        });

        return res.json({success: true});

    } catch(error) {
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token',    {httpOnly: true, 
                                    secure: process.env.NODE_ENV === 'production', 
                                    sameSite: process.env.NODE_ENV === 'production' ? 
                                    'none' : 'strict',
                                    maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({success: true, message: 'Logged out successfully'});
    } catch(error) {
        return res.json({success: false, message: error.message});
    }
}

export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.userId; // get user ID from middleware
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: 'User already verified' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Verify your account',
      text: `Your verification OTP is ${otp}. It is valid for 24 hours.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
    const userId= req.userId;
    const {otp} = req.body;
    console.log(userId, otp);


    if(!userId || !otp) {
        return res.json({success: false, message: 'Missing details'});
    }

    try {

        const user = await userModel.findById(userId);
        console.log(user.name)

        if(!user) {
            return res.json({success: false, message: 'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpires < Date.now()) {
            return res.json({success: false, message: 'OTP expired'});
        }

        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpires = 0;

        await user.save();

        return res.json({success: true, message: 'Email verified successfully'});


    } catch(error) {
        return res.json({success: false, message: error.message});
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId; // From userAuth middleware
        
        const user = await userModel.findById(userId).select('-password -verifyOtp -verifyOtpExpires');
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({ 
            success: true, 
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username || user.name, // fallback to name if no username
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};