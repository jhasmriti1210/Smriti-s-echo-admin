const nodemailer = require("nodemailer");
const Subscriber = require("../models/subscribe");

// Send welcome email to the new subscriber
const sendWelcomeEmail = async (subscriberEmail) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // You can change this to another email service
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Smriti's Echoes" <${process.env.MY_EMAIL}>`,
            to: subscriberEmail,
            subject: "Welcome to Smriti's Echoes Newsletter!",
            html: `
                <p>Hello,</p>
                <p>Thank you for subscribing to Smriti's Echoes Newsletter! 🎉</p>
                <p>You will now receive regular updates about new poetry, upcoming events, and exclusive content.</p>
                <p><strong>Here’s what you can expect:</strong></p>
                <ul>
                    <li>Beautiful poetry updates</li>
                    <li>Insightful discussions on creativity</li>
                    <li>Special offers and news</li>
                </ul>
                <p>Stay tuned for our upcoming newsletter!</p>
                <p>Best regards,</p>
                <p>The Smriti's Echoes Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent successfully.");
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
};

// Send contact query to email
const sendQuery = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.MY_EMAIL,
            subject: `New Query from ${name}`,
            html: `
                <h2>User Query</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Query sent successfully." });
    } catch (error) {
        console.error("Query sending error:", error);
        return res.status(500).json({ message: "Failed to send query. Try again later." });
    }
};

// Save newsletter subscription to MongoDB and send a welcome email
const subscribeNewsletter = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required." });
    }

    try {
        // Check if already subscribed
        const existing = await Subscriber.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "You are already subscribed." });
        }

        // Save to MongoDB
        const subscriber = new Subscriber({ email });
        await subscriber.save();

        // Send the welcome email
        await sendWelcomeEmail(email);

        // Respond back to the client
        res.status(200).json({ message: "Thank you for subscribing! A welcome email has been sent." });
    } catch (error) {
        console.error("Error saving subscriber:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};

module.exports = {
    sendQuery,
    subscribeNewsletter,
};
