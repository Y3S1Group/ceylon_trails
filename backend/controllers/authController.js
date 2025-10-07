import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userModel from '../models/userModel.js';
import { text } from 'express';
import transporter from '../config/nodemailer.js';
import postsModel from '../models/Posts.js'; 
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';


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


//updated login to fix loading issues (OLD CODE AVAILABLE BELOW)
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || user.name
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


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

// New
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId; // From middleware

    const user = await userModel
      .findById(userId)
      .select('-password -verifyOtp -verifyOtpExpires');

    if (!user) {
      return res.json({ loggedIn: false, user: null });
    }

    return res.json({
      loggedIn: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username || user.name,
        profileImage: user.profileImage || '',
        backgroundImage: user.backgroundImage || ''
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ loggedIn: false, user: null });
  }
};

//update user profile function
export const updateProfile = async (req, res) => {
    const userId = req.userId;
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
        return res.json({ success: false, message: 'No update data provided' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check email uniqueness if email is being updated
        if (email && email !== user.email) {
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.json({ success: false, message: 'Email already exists' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await userModel.findByIdAndUpdate(userId, updateData);

        return res.json({ success: true, message: 'Profile updated successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Upload Profile Image - New
export const uploadProfileImage = async (req, res) => {
    const userId = req.userId;

    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No image file provided' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Delete old profile image from Cloudinary if exists
        if (user.profileImagePublicId) {
            try {
                await deleteFromCloudinary(user.profileImagePublicId);
            } catch (error) {
                console.error('Error deleting old profile image:', error);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        // Update user with new image
        user.profileImage = uploadResult.url;
        user.profileImagePublicId = uploadResult.publicId;
        await user.save();

        return res.json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: uploadResult.url
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Upload Background Image - New
export const uploadBackgroundImage = async (req, res) => {
    const userId = req.userId;

    try {
        if (!req.file) {
            return res.json({ success: false, message: 'No image file provided' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Delete old background image from Cloudinary if exists
        if (user.backgroundImagePublicId) {
            try {
                await deleteFromCloudinary(user.backgroundImagePublicId);
            } catch (error) {
                console.error('Error deleting old background image:', error);
            }
        }

        // Upload new image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

        // Update user with new image
        user.backgroundImage = uploadResult.url;
        user.backgroundImagePublicId = uploadResult.publicId;
        await user.save();

        return res.json({
            success: true,
            message: 'Background image uploaded successfully',
            backgroundImage: uploadResult.url
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Delete Profile Image - New
export const deleteProfileImage = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (!user.profileImagePublicId) {
            return res.json({ success: false, message: 'No profile image to delete' });
        }

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(user.profileImagePublicId);
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
        }

        // Update user
        user.profileImage = '';
        user.profileImagePublicId = '';
        await user.save();

        return res.json({
            success: true,
            message: 'Profile image deleted successfully'
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Delete Background Image - New
export const deleteBackgroundImage = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (!user.backgroundImagePublicId) {
            return res.json({ success: false, message: 'No background image to delete' });
        }

        // Delete from Cloudinary
        try {
            await deleteFromCloudinary(user.backgroundImagePublicId);
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
        }

        // Update user
        user.backgroundImage = '';
        user.backgroundImagePublicId = '';
        await user.save();

        return res.json({
            success: true,
            message: 'Background image deleted successfully'
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

//delete user profile function - New
export const deleteProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        
        // Delete profile image from Cloudinary if exists
        if (user.profileImagePublicId) {
            try {
                await deleteFromCloudinary(user.profileImagePublicId);
            } catch (error) {
                console.error('Error deleting profile image:', error);
            }
        }

        // Delete background image from Cloudinary if exists
        if (user.backgroundImagePublicId) {
            try {
                await deleteFromCloudinary(user.backgroundImagePublicId);
            } catch (error) {
                console.error('Error deleting background image:', error);
            }
        }
        
        // Delete all user posts
        await postsModel.deleteMany({ userId: userId });
        
        // Delete user account
        await userModel.findByIdAndDelete(userId);

        // Clear authentication cookie
        res.clearCookie('token', {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        return res.json({ success: true, message: 'Account and all posts deleted successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};


export const adminRegister = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const admin = new userModel({
            name,
            email,
            password: passwordHash,
            role: "admin", // force admin role
        });
        await admin.save();

        const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Send admin welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome Admin",
            text: `Hello ${name},\n\nYour admin account has been created successfully.\n\nBest regards,\nYour Service Team`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

