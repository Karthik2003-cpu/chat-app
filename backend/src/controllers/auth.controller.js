import User from '../models/user.models.js';
import {generateToken} from '../lib/utils.js';
import bcrypt from 'bcryptjs';
import cloudinary from "../lib/cloudinary.js";
import Message from '../models/message.models.js';
import ChatRequest from '../models/chatRequest.models.js';

export const signup = async (req, res) => {
    const {fullName,email, password} = req.body
    try {
        if(!fullName || !email || !password){
            return res.status(400).json({msg: "Please fill in all fields"});
        }
        if(password.length < 6){
            return res.status(400).json({msg: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});

        if(user) return res.status(400).json({msg: "Email already exists"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if(newUser)
        {
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json(newUser);
        }
        else{
            return res.status(400).json({msg: "Invalid user data"});
        }
        
    } catch (error) {
        console.log('error in login', error);
        res.status(500).json({msg: "Server Error"});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({msg: "Invalid credentials"});
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect) return res.status(400).json({msg: "Invalid credentials"});

        generateToken(user._id, res);
        res.status(200).json(user); 
    } catch (error) {
        console.log('error in login', error);
        res.status(500).json({msg: "internal server error"});
    }
};  

export const logout = (req, res) => {
    
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.status(200).json({msg: "Logged out successfully"});
    } catch (error) {
        console.log('error in logout', error);
        res.status(500).json({msg: "internal server error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName } = req.body;
        const userId = req.user._id;

        const updateData = {};
        
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
        }

        if (fullName) {
            updateData.fullName = fullName;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ msg: "No update data provided" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in updateProfile", error);
        res.status(500).json({ msg: "internal server error" });
    }
};

export const checkauth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('error in checkauth', error);
        res.status(500).json({msg: "internal server error"});
    }
};

export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        if (!email || !newPassword) {
            return res.status(400).json({ msg: "Please provide email and new password" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ msg: "Password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ msg: "Password reset successful" });
    } catch (error) {
        console.log('error in resetPassword:', error);
        res.status(500).json({ msg: "Internal server error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all messages associated with the user
        await Message.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        // Delete all chat requests associated with the user
        await ChatRequest.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }]
        });

        // Delete the user
        await User.findByIdAndDelete(userId);

        // Clear the JWT cookie
        res.cookie('jwt', '', { maxAge: 0 });

        res.status(200).json({ msg: "Account deleted successfully" });
    } catch (error) {
        console.log('error in deleteAccount:', error);
        res.status(500).json({ msg: "Internal server error" });
    }
};