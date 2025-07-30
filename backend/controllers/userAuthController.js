const authModel = require("../models/userAuthModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require("nodemailer");
require('dotenv').config();
const poetryModel = require('../models/poetryModel');
const disposableList = require('disposable-email-domains');
const disposableSet = new Set(disposableList);
// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true
});

// Multer setup for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASS,
    },
});

class authController {



    // User Signup Controller
    user_signup = async (req, res) => {
        try {
            // Use Multer for file handling
            upload.single('profilePicture')(req, res, async (err) => {
                if (err) {
                    console.error('Multer Error:', err);
                    return res.status(400).json({ success: false, message: 'Error uploading profile picture' });
                }

                const { fullName, email, password } = req.body;
                const profilePictureFile = req.file;

                if (!fullName || !email || !password) {
                    return res.status(400).json({ success: false, message: 'Please provide fullName, email, and password' });
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ success: false, message: 'Invalid email format' });
                }

                //  Block temp email domains
                const emailDomain = email.split('@')[1].toLowerCase();

                if (disposableSet.has(emailDomain)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Temporary or disposable email addresses are not allowed.'
                    });
                }

                // Check if the user already exists
                const existingUser = await authModel.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ success: false, message: "User already exists!" });
                }

                let profilePictureUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Default avatar

                // If profile picture is uploaded, process it
                if (profilePictureFile) {
                    try {
                        console.log('Starting profile picture upload...');
                        console.log('Cloudinary Config:', {
                            cloudName: process.env.cloud_name ? 'Set' : 'Not Set',
                            apiKey: process.env.api_key ? 'Set' : 'Not Set',
                            apiSecret: process.env.api_secret ? 'Set' : 'Not Set'
                        });

                        // Create a buffer from the file
                        const buffer = profilePictureFile.buffer;
                        console.log('File buffer created, size:', buffer.length, 'mime type:', profilePictureFile.mimetype);

                        // Convert buffer to base64
                        const base64String = `data:${profilePictureFile.mimetype};base64,${buffer.toString('base64')}`;
                        console.log('Successfully converted to base64');

                        // Upload directly to Cloudinary using base64
                        const cloudinaryResult = await cloudinary.uploader.upload(base64String, {
                            folder: "user_profiles",
                            public_id: `${Date.now()}_${fullName.replace(/\s+/g, '_')}`,
                            resource_type: "image",
                            width: 300,
                            height: 300,
                            crop: "fill",
                            quality: "auto:good",
                            secure: true,
                        });

                        console.log('Cloudinary upload successful:', cloudinaryResult.secure_url);
                        profilePictureUrl = cloudinaryResult.secure_url; // Get the URL from Cloudinary response

                    } catch (uploadError) {
                        console.error('Cloudinary Upload Error Details:', {
                            error: uploadError.message,
                            stack: uploadError.stack
                        });
                        return res.status(500).json({
                            success: false,
                            message: "Failed to upload profile picture. Please try again with a different image or contact support.",
                            error: uploadError.message
                        });
                    }
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = new authModel({
                    fullName,
                    email,
                    password: hashedPassword,
                    profilePicture: profilePictureUrl,
                    isVerified: false,
                });

                await newUser.save();

                // Generate a verification token
                const verificationToken = jwt.sign({ userId: newUser._id }, process.env.secret, {
                    expiresIn: '1d', // Token expiration time
                });

                const frontendUrl = process.env.FRONTEND_URL || 'https://smriti-jha-userdashboard.onrender.com';
                const verificationLink = `${frontendUrl}/loginstuff/verify-email?token=${verificationToken}`;

                // Sending confirmation email
                const mailOptions = {
                    from: process.env.MY_EMAIL,
                    to: email,
                    subject: "Welcome to Smriti's Echoes – Unleash Your Creativity!",
                    text: `Hi ${fullName},\n\nWelcome aboard, and thank you for joining Smriti's Echoes! To complete your registration, please verify your email address by clicking the link below:\n\n${verificationLink}`,
                    html: `<p>Hi <strong>${fullName}</strong>,</p><p>Welcome aboard, and thank you for joining Smriti's Echoes!</p><p>To complete your registration, please verify your email address by clicking the link below:</p><p><a href="${verificationLink}">Verify Email</a></p>`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Confirmation email sent:', info.response);
                    }
                });

                res.status(201).json({
                    success: true,
                    message: "User created successfully! Please check your email for verification.",
                    token: verificationToken,  // Return verification token in response
                    user: {
                        fullName: newUser.fullName,
                        email: newUser.email,
                        profilePicture: newUser.profilePicture,
                    }
                });
            });
        } catch (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    };

    // Email verification route
    verify_email = async (req, res) => {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ success: false, message: 'Verification token is required' });
            }

            const decoded = jwt.verify(token, process.env.secret);
            const user = await authModel.findById(decoded.userId);

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Mark the user as verified
            user.isVerified = true;
            await user.save();

            res.status(200).json({ success: true, message: 'Email verified successfully' });
        } catch (error) {
            console.error('Verification Error:', error);
            return res.status(500).json({ success: false, message: 'Verification failed' });
        }
    };

    //login function
    user_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await authModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email before logging in. You should have received a verification email."
                });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ success: false, message: "Invalid credentials" });
            }

            const token = jwt.sign({ userId: user._id }, process.env.secret, {
                expiresIn: process.env.exp_time,
            });

            res.status(200).json({
                success: true,
                message: "Login successful!",
                token,
                data: {
                    user: {
                        _id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        profilePicture: user.profilePicture,
                    }
                }
            });

        } catch (error) {
            console.error("Login Error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    };



    // ✅ Check User Controller
    check_user = async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ exists: false, message: "Email is required" });
            }

            const user = await authModel.findOne({ email });

            if (user) {
                return res.status(200).json({ exists: true });
            } else {
                return res.status(200).json({ exists: false });
            }
        } catch (error) {
            console.error('Check User Error:', error);
            return res.status(500).json({ exists: false, message: "Server error" });
        }
    };


    get_user_profile = async (req, res) => {
        try {
            const userId = req.userId;
            console.log("🔍 Extracted userId from token:", userId);

            const user = await authModel.findOne({ _id: userId }).select("-password");
            console.log("🔍 User Found:", user);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            res.status(200).json({ success: true, data: user });
        } catch (error) {
            console.error("❌ Get Profile Error:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    };


    // Update User Profile
    update_user_profile = async (req, res) => {
        upload.single('profilePicture')(req, res, async (err) => {
            if (err) {
                console.error('Multer Error:', err);
                return res.status(400).json({ success: false, message: 'Error uploading profile picture' });
            }

            try {
                const userId = req.userId; // ✅ FIXED: Correct way to access userId from middleware
                const { fullName, email, password } = req.body;

                const user = await authModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }

                // Update fields if provided
                if (fullName) user.fullName = fullName;
                if (email) {
                    const existingUserWithEmail = await authModel.findOne({ email });
                    if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                        return res.status(400).json({ success: false, message: "Email already in use" });
                    }
                    user.email = email;
                }
                if (password) user.password = await bcrypt.hash(password, 10);

                // Upload new profile picture
                if (req.file) {
                    try {
                        // Convert buffer to base64
                        const base64String = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

                        const uploadResult = await cloudinary.uploader.upload(base64String, {
                            folder: "user_profiles",
                            secure: true,
                            width: 300,
                            height: 300,
                            crop: "fill",
                            quality: "auto:good"
                        });

                        user.profilePicture = uploadResult.secure_url;
                    } catch (uploadError) {
                        console.error("Cloudinary Upload Error:", uploadError);
                        return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
                    }
                }

                await user.save();

                res.status(200).json({
                    success: true,
                    message: "Profile updated successfully",
                    data: {
                        fullName: user.fullName,
                        email: user.email,
                        profilePicture: user.profilePicture,
                    }
                });

            } catch (error) {
                console.error("Update Profile Error:", error);
                return res.status(500).json({ success: false, message: "Server error" });
            }
        });
    };

    toggle_favorite_poem = async (req, res) => {
        const { poetry_id } = req.params;
        const userId = req.userId;

        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(poetry_id) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid poetry ID or user ID" });
        }

        try {
            const poem = await poetryModel.findById(poetry_id);
            if (!poem) {
                return res.status(404).json({ message: "Poetry not found" });
            }

            const user = await authModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const isFavorite = user.favorites.includes(poetry_id);
            const updateAction = isFavorite
                ? { $pull: { favorites: poetry_id } }
                : { $addToSet: { favorites: poetry_id } };

            // ✅ Populate favorites after update
            const updatedUser = await authModel.findByIdAndUpdate(userId, updateAction, { new: true })
                .populate('favorites');

            return res.status(200).json({
                message: isFavorite
                    ? "Removed from favorites"
                    : "Added to favorites",
                favorites: updatedUser.favorites, // ✅ Now returns poem objects, not just IDs
            });

        } catch (error) {
            console.error("Error toggling favourite poem:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };


    //get user favourite poem

    get_user_favorites = async (req, res) => {
        const userId = req.userId;

        if (!userId || userId.length !== 24) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        try {
            const user = await authModel.findById(userId)
                .populate('favorites'); // will populate full poetry objects

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            return res.status(200).json({
                favorites: user.favorites
            });

        } catch (error) {
            console.error("Error fetching favourites:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };


    // Remove a poetry from user's favorites
    delete_favorite_poem = async (req, res) => {
        const { poetry_id } = req.params;
        const userId = req.userId;

        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(poetry_id) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid poetry ID or user ID" });
        }

        try {
            const poem = await poetryModel.findById(poetry_id);
            if (!poem) {
                return res.status(404).json({ message: "Poetry not found" });
            }

            const user = await authModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Remove poetry_id from favorites array
            const updatedUser = await authModel.findByIdAndUpdate(
                userId,
                { $pull: { favorites: poetry_id } },
                { new: true }
            ).populate('favorites'); // Populate full poetry objects after update

            return res.status(200).json({
                message: "Removed from favorites",
                favorites: updatedUser.favorites,
            });

        } catch (error) {
            console.error("Error deleting favourite poem:", error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    };



    // Log out User Controller
    user_logout = (req, res) => {
        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    };
}

module.exports = new authController();




