const authModel = require("../models/userAuthModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require("nodemailer");

// Multer setup for local file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

const upload = multer({ storage: storage });

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

                // Check if the user already exists
                const existingUser = await authModel.findOne({ email });
                if (existingUser) {
                    return res.status(400).json({ success: false, message: "User already exists!" });
                }

                let profilePictureUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Default avatar

                // If profile picture is uploaded, process it
                if (profilePictureFile) {
                    const localPath = `./uploads/${profilePictureFile.filename}`;

                    // Upload to Cloudinary after saving locally
                    try {
                        const cloudinaryResult = await cloudinary.uploader.upload(localPath, {
                            folder: "user_profiles",
                            public_id: `${Date.now()}_${fullName.replace(/\s+/g, '_')}`,
                            resource_type: "image",
                            width: 300,
                            height: 300,
                            crop: "fill",
                            quality: "auto:good",
                        });

                        profilePictureUrl = cloudinaryResult.secure_url; // Get the URL from Cloudinary response

                        // Delete the local file after uploading to Cloudinary
                        fs.unlinkSync(localPath);

                    } catch (uploadError) {
                        console.error('Cloudinary Upload Error:', uploadError);
                        return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
                    }
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = new authModel({
                    fullName,
                    email,
                    password: hashedPassword,
                    profilePicture: profilePictureUrl,
                    isVerified: false, // Flag for email verification
                });

                await newUser.save();

                // Generate a verification token
                const verificationToken = jwt.sign({ userId: newUser._id }, process.env.secret, {
                    expiresIn: '1d', // Token expiration time
                });

                const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`;

                // Sending confirmation email
                const mailOptions = {
                    from: process.env.MY_EMAIL, // sender address
                    to: email, // receiver address
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


    user_login = async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await authModel.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // ✅ Check if the user is verified once during account creation
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

            // JWT Token generation if credentials are valid and email is verified
            const token = jwt.sign({ userId: user._id }, process.env.secret, {
                expiresIn: process.env.exp_time,
            });

            res.status(200).json({
                success: true,
                message: "Login successful!",
                token,
                data: {
                    user: {
                        fullName: user.fullName,
                        email: user.email,
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

    // ✅ Update Profile Controller
    update_profile = async (req, res) => {
        try {
            // Use Multer for file handling
            upload.single('profilePicture')(req, res, async (err) => {
                if (err) {
                    console.error('Multer Error:', err);
                    return res.status(400).json({ success: false, message: 'Error uploading profile picture' });
                }

                const { fullName, email, password } = req.body;
                const profilePictureFile = req.file;

                // Check if the user is authenticated (assuming userId is passed via JWT token)
                const userId = req.user.userId; // This should be set in your authentication middleware

                if (!userId) {
                    return res.status(401).json({ success: false, message: 'User not authenticated' });
                }

                if (!fullName && !email && !password && !profilePictureFile) {
                    return res.status(400).json({ success: false, message: 'No information to update' });
                }

                // Fetch the user from the database
                const user = await authModel.findById(userId);
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                // If email is updated, check if the new email is already taken
                if (email && email !== user.email) {
                    const existingUser = await authModel.findOne({ email });
                    if (existingUser) {
                        return res.status(400).json({ success: false, message: 'Email is already in use' });
                    }
                }

                // Update profile picture if new one is uploaded
                let profilePictureUrl = user.profilePicture; // Default to current profile picture
                if (profilePictureFile) {
                    const localPath = `./uploads/${profilePictureFile.filename}`;

                    try {
                        const cloudinaryResult = await cloudinary.uploader.upload(localPath, {
                            folder: "user_profiles",
                            public_id: `${Date.now()}_${fullName.replace(/\s+/g, '_')}`,
                            resource_type: "image",
                            width: 300,
                            height: 300,
                            crop: "fill",
                            quality: "auto:good",
                        });

                        profilePictureUrl = cloudinaryResult.secure_url; // Update the URL
                        fs.unlinkSync(localPath); // Remove local file after uploading
                    } catch (uploadError) {
                        console.error('Cloudinary Upload Error:', uploadError);
                        return res.status(500).json({ success: false, message: "Failed to upload profile picture" });
                    }
                }

                // If password is updated, hash the new password
                let hashedPassword = user.password;
                if (password) {
                    hashedPassword = await bcrypt.hash(password, 10);
                }

                // Update the user with new data
                const updatedUser = await authModel.findByIdAndUpdate(
                    userId,
                    {
                        fullName: fullName || user.fullName,
                        email: email || user.email,
                        password: hashedPassword,
                        profilePicture: profilePictureUrl,
                    },
                    { new: true }
                );

                res.status(200).json({
                    success: true,
                    message: 'Profile updated successfully',
                    user: {
                        fullName: updatedUser.fullName,
                        email: updatedUser.email,
                        profilePicture: updatedUser.profilePicture,
                    }
                });
            });
        } catch (error) {
            console.error('Update Profile Error:', error);
            return res.status(500).json({ success: false, message: 'Error updating profile' });
        }
    };

    // Log out User Controller
    user_logout = (req, res) => {
        res.clearCookie("token");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    };
}

module.exports = new authController();



// //google login-signup
// user_google_login = (req, res, next) => {
//     passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
// };
// user_google_callback = (req, res, next) => {
//     passport.authenticate('google', { session: false }, async (err, user) => {
//         if (err) {
//             console.error("Error during Google callback:", err);
//             return res.status(500).json({ message: "Internal server error" });
//         }

//         if (!user) {
//             console.error("No user found after Google authentication.");
//             return res.status(401).json({ message: "Authentication failed" });
//         }

//         try {
//             let existingUser = await authModel.findOne({ email: user.email });

//             if (!existingUser) {
//                 existingUser = new authModel({
//                     fullName: user.displayName || 'No Name',
//                     email: user.email,
//                     googleId: user.id,
//                     password: null, // No password initially
//                 });
//                 await existingUser.save();
//                 console.log("New user created:", existingUser.email);
//             } else {
//                 console.log("Existing user login:", existingUser.email);
//             }

//             // If the user doesn't have a password, prompt them to set one
//             if (existingUser.password === null) {
//                 return res.status(200).json({
//                     success: true,
//                     message: 'Google login successful! Please set a password for future logins.',
//                     setPasswordRequired: true, // flag indicating the user needs to set a password
//                     user: {
//                         id: existingUser._id,
//                         fullName: existingUser.fullName,
//                         email: existingUser.email,
//                     },
//                 });
//             }

//             const token = jwt.sign(
//                 { userId: existingUser._id },
//                 process.env.secret,
//                 { expiresIn: process.env.exp_time }
//             );

//             return res.status(200).json({
//                 success: true,
//                 message: 'Google login successful!',
//                 token,
//                 user: {
//                     id: existingUser._id,
//                     fullName: existingUser.fullName,
//                     email: existingUser.email,
//                 },
//             });

//         } catch (error) {
//             console.error("Error during user creation or login:", error);
//             return res.status(500).json({ message: "Server error while processing Google login" });
//         }
//     })(req, res, next);
// };

// user_set_password = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: 'Please provide email and password' });
//     }

//     try {
//         const user = await authModel.findOne({ email });

//         if (!user) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }

//         // Ensure user has no password already set
//         if (user.password !== null) {
//             return res.status(400).json({ success: false, message: 'Password is already set for this account' });
//         }

//         // Hash the new password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         user.password = hashedPassword;

//         // Update password and set the updatedAt field
//         user.updatedAt = Date.now();
//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: 'Password set successfully',
//         });

//     } catch (error) {
//         console.error('Set Password Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };


