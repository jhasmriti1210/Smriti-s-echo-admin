const nodemailer = require("nodemailer");
const Subscriber = require("../models/Subscribe");

const sendNewContentToSubscribers = async ({ title, description, image, slug }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MY_EMAIL,
                pass: process.env.MY_EMAIL_PASS,
            },
        });

        const subscribers = await Subscriber.find();

        for (const sub of subscribers) {
            const mailOptions = {
                from: `"Smriti's Echoes" <${process.env.MY_EMAIL}>`,
                to: sub.email,
                subject: `📜 New Poetry: ${title}`,
                html: `
                    <h2>${title}</h2>
                    <p>${description.slice(0, 100)}...</p>
                    <img src="${image}" alt="Poetry image" style="max-width:100%;border-radius:8px;" />
                    <p>
                        <a href="${process.env.FRONTEND_URL}/poetry/${slug}" style="padding:10px 16px;background:#6D28D9;color:#fff;text-decoration:none;border-radius:4px;">
                            Read Now
                        </a>
                    </p>
                    <hr />
                    <p style="font-size: 0.8em; color: gray;">You're receiving this because you subscribed to Smriti's Echoes.</p>
                `,
            };

            await transporter.sendMail(mailOptions);
        }

        console.log("✅ Poetry notification emails sent.");
    } catch (error) {
        console.error("❌ Failed to send subscriber emails:", error);
    }
};

module.exports = { sendNewContentToSubscribers };
