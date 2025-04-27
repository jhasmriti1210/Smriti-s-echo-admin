const authModel = require("../models/userAuthModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require('passport');

class authController {
    // ✅ Signup Controller
    user_signup = async (req, res) => {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide fullName, email, and password' });
        }

        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, message: 'Invalid email format' });
            }

            const existingUser = await authModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists!" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new authModel({
                fullName,
                email,
                password: hashedPassword,
            });

            await newUser.save();

            const token = jwt.sign({ userId: newUser._id }, process.env.secret, {
                expiresIn: process.env.exp_time,
            });

            res.status(201).json({
                success: true,
                message: "User created successfully!",
                token,
            });
        } catch (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    };

    // ✅ Login Controller
    user_login = async (req, res) => {
        const { email, password } = req.body;
        console.log("Login request:", email, password);

        try {
            const user = await authModel.findOne({ email });
            if (!user) {
                console.log("User not found");
                return res.status(401).json({ message: "Invalid credentials" });
            }

            console.log("User found:", user);
            const isPasswordValid = await user.comparePassword(password);
            console.log("Password valid?", isPasswordValid);

            if (!isPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials",
                });
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

    // ✅ Check User Controller (New)
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
            return res.status(500).json({ exists: false, message: "Server error", error: error.message });
        }
    };





    // Google login redirect (to trigger the OAuth flow)
    user_google_login = (req, res, next) => {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    };

    // Google callback URL after successful authentication
    user_google_callback = (req, res) => {
        passport.authenticate('google', { session: false }, async (err, user) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Internal server error" });
            }
            if (!user) {
                return res.status(401).json({ message: "Authentication failed" });
            }

            // Check if user exists in the database
            let existingUser = await authModel.findOne({ email: user.email });

            if (!existingUser) {
                // If user doesn't exist, create a new user
                try {
                    const newUser = new authModel({
                        fullName: user.displayName, // or get the user's name from Google profile
                        email: user.email,
                        googleId: user.id, // Store the Google ID for later reference
                    });

                    await newUser.save();

                    // Generate a JWT token after Google login
                    const token = jwt.sign({ userId: newUser._id }, process.env.secret, {
                        expiresIn: process.env.exp_time,
                    });

                    return res.status(200).json({
                        success: true,
                        message: 'Google login successful! New user created.',
                        token,
                    });

                } catch (error) {
                    console.error("Error creating new user:", error);
                    return res.status(500).json({ message: "Error creating user after Google login" });
                }
            } else {
                // If user already exists, generate token and log them in
                const token = jwt.sign({ userId: existingUser._id }, process.env.secret, {
                    expiresIn: process.env.exp_time,
                });

                return res.status(200).json({
                    success: true,
                    message: 'Google login successful!',
                    token,
                });
            }
        })(req, res);
    };

}

module.exports = new authController();
