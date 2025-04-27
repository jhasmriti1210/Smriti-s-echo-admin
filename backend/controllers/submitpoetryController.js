const cloudinary = require('cloudinary').v2;
const Poetry = require("../models/submitPoetryModel");
const path = require('path');
const multer = require('multer');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Define storage for audio file upload
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/audio/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer to handle audio file uploads
const audioUpload = multer({
    storage: audioStorage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /mp3|wav/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Invalid file type. Only MP3 or WAV files are allowed."));
        }
    }
}).single("audio");

// Submit Poetry Function (Including optional audio handling)
const submitPoetry = (req, res) => {
    // Handle audio file upload
    audioUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }


        if (req.file) {
            try {
                // Upload audio file to Cloudinary
                const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "auto",
                    folder: "userpoetry_audio",
                });

                const audioUrl = cloudinaryResult.secure_url;
                req.file.path = audioUrl;
            } catch (uploadError) {
                return res.status(500).json({ message: "Error uploading audio to Cloudinary.", error: uploadError.message });
            }
        }

        // Get poetry data from the request body
        const { fullName, email, category, title, poetryText } = req.body;
        const audioFile = req.file ? req.file.path : null;

        try {
            // Save poetry details in the database
            const newPoetry = new Poetry({
                fullName,
                email,
                category,
                title,
                poetryText,
                audio: audioFile,
            });

            await newPoetry.save();

            return res.status(201).json({ message: "Poetry submitted successfully!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "An error occurred while submitting poetry.", error });
        }
    });
};

module.exports = { submitPoetry };
