const nodemailer = require("nodemailer");
const Subscriber = require("../models/subscribe");

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
                subject: `New Poetry Release: "${title}" by Smriti`,
                html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background: #f9f9f9; color: #333;">
            <header style="text-align: center; padding-bottom: 20px;">
                <h1 style="color: #6D28D9; font-size: 24px; margin: 0;">Smriti's Echoes</h1>
                <p style="font-size: 14px; margin: 5px 0;">Giving words to every emotion, every story.</p>
            </header>

            <section style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #333; font-size: 22px;">${title}</h2>
                <p style="font-size: 16px; line-height: 1.6;">${description.slice(0, 100)}...</p>
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${process.env.FRONTEND_URL}/poetry/${slug}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #6D28D9; color: #fff; 
                              text-decoration: none; border-radius: 4px; font-weight: bold;">
                        Read the Full Poem
                    </a>
                </div>
                <p style="font-size: 14px; color: #555; margin-top: 25px; text-align: center;">
                    If this poem resonates with you, take a moment to <strong>rate it</strong> and leave a <strong>comment</strong>. 
                    Your feedback means the world and helps keep the words flowing.
                </p>
            </section>

            <footer style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
                <p>Poem by <strong>Smriti</strong> • Published on ${new Date().toLocaleDateString()}</p>
                <p>You are receiving this email because you subscribed to <em>Smriti's Echoes</em>.</p>
            </footer>
        </div>
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
