const cloudinary = require('cloudinary').v2;
const Poetry = require("../models/submitPoetryModel");
const path = require('path');
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

// Multer config
const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/audio/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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

// 🔸 Submit Poetry
const submitPoetry = (req, res) => {
    audioUpload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        let audioFile = null;

        if (req.file) {
            try {
                const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
                    resource_type: "auto",
                    folder: "userpoetry_audio",
                });

                audioFile = cloudinaryResult.secure_url;
            } catch (uploadError) {
                return res.status(500).json({ message: "Error uploading audio to Cloudinary.", error: uploadError.message });
            }
        }

        const { fullName, email, category, title, poetryText } = req.body;

        try {
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

const getAllUserPoetry = async (req, res) => {
    try {
        const poetryList = await Poetry.find().sort({ createdAt: -1 });
        res.status(200).json(poetryList);
    } catch (error) {
        console.error("Error fetching poetry:", error);
        res.status(500).json({ message: 'Error fetching poetry', error });
    }


};


// 🔸 Get Single Poetry by ID
const getSinglePoetry = async (req, res) => {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid poetry ID format." });
    }

    try {
        const poetry = await Poetry.findById(id);

        if (!poetry) {
            return res.status(404).json({ message: "Poetry not found." });
        }

        res.status(200).json(poetry);
    } catch (error) {
        console.error("Error fetching poetry by ID:", error);
        res.status(500).json({ message: "Server error while fetching poetry." });
    }
};

// ✅ Export properly
module.exports = { submitPoetry, getAllUserPoetry, getSinglePoetry };
