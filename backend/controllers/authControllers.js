const authModel = require("../models/authModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_EMAIL_PASS
    }
});

class authController {
    login = async (req, res) => {
        const { email, password } = req.body

        if (!email) {
            return res.status(404).json({ message: "Please provide your email" })
        }
        if (!password) {
            return res.status(404).json({ message: "Please provide your password" })
        }

        try {
            const user = await authModel.findOne({ email }).select("+password")
            if (user) {
                const match = await bcrypt.compare(password, user.password)
                if (match) {
                    const obj = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        category: user.category,
                        role: user.role,
                    }
                    const token = await jwt.sign(obj, process.env.secret, {
                        expiresIn: process.env.exp_time
                    })
                    return res.status(200).json({ message: "login success", token })
                } else {
                    return res.status(404).json({ message: "Invalid Password" })
                }
            } else {
                return res.status(404).json({ message: "User not found" })
            }

        } catch (error) {
            console.log(error)
        }
    }

    change_password = async (req, res) => {
        const { old_password, new_password } = req.body;
        const userId = req.userInfo.id;

        if (!old_password) {
            return res.status(400).json({ message: "Please provide your old password" });
        }
        if (!new_password) {
            return res.status(400).json({ message: "Please provide your new password" });
        }

        try {
            const user = await authModel.findById(userId).select("+password");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const match = await bcrypt.compare(old_password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Old password is incorrect" });
            }

            const hashedPassword = await bcrypt.hash(new_password, 10);
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({ message: "Password changed successfully" });

        } catch (error) {
            console.error("Password change error:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    add_writer = async (req, res) => {
        const { email, name, password, category } = req.body;

        // Validate input fields
        if (!name || !password || !category || !email) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Validate email format
        if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            return res.status(400).json({ message: 'Please provide a valid email' });
        }

        try {
            // Check if the writer already exists
            const existingWriter = await authModel.findOne({ email: email.trim() });
            if (existingWriter) {
                return res.status(400).json({ message: 'Writer already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password.trim(), 10);

            // Create a new writer in the database
            const new_writer = await authModel.create({
                name: name.trim(),
                email: email.trim(),
                password: hashedPassword,
                category: category.trim(),
                role: 'writer'
            });

            // Email content (Text and HTML versions)
            const mailOptions = {
                from: process.env.MY_EMAIL,
                to: email.trim(),
                subject: 'Welcome to the Writers Platform!',
                // Text version (helps avoid spam)
                text: `Dear ${name},
    
    You have successfully been added as a writer for the ${category} Category.
    
    Please find your registration details below:
    
    Email: ${email}
    Password: ${password}
    
    You can now log in and start contributing your poetry!
    
    If you have any questions, please don't hesitate to reach out.
    
    Regards,
    Admin Team
    `,
                // HTML version (nicely formatted)
                html: `<p>Dear ${name},</p>
                       <p>Welcome! You have successfully been added as a writer for the <strong>${category}</strong> category.</p>
                       <p><strong>Email:</strong> ${email}</p>
                       <p><strong>Password:</strong> ${password}</p>
                       <p>You can now <a href="http://localhost:5173/login" target="_blank">log in</a> and start contributing your poetry.</p>
                       <p>If you have any questions or need assistance, feel free to <a href="mailto:smritipoetry@gmail.com">contact us</a>.</p>
                       <p>Regards,<br/>Admin Team</p>`
            };

            // Send the email
            await transporter.sendMail(mailOptions);

            // Respond with success
            return res.status(201).json({ message: 'Writer added successfully', writer: new_writer });

        } catch (error) {
            console.error('Error adding writer:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    get_writers = async (req, res) => {
        try {
            const writers = await authModel.find({ role: "writer" }).sort({ createdAt: -1 })
            return res.status(200).json({ writers })
        } catch (error) {
            return res.status(500).json({ message: 'internal server error' })
        }
    }

    delete_writer = async (req, res) => {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Please provide writer ID to delete' });
        }

        try {
            const writer = await authModel.findById(id);

            if (!writer) {
                return res.status(404).json({ message: 'Writer not found' });
            }

            await authModel.deleteOne({ _id: id });

            return res.status(200).json({ message: 'Writer deleted successfully' });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };
}

module.exports = new authController()
