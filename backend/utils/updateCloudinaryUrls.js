const mongoose = require('mongoose');
const dotenv = require('dotenv');
const poetryModel = require('../models/poetryModel');
const galleryModel = require('../models/galleryModel');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
    .connect(process.env.mode === "production" ? process.env.db_production_url : process.env.db_local_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    });

async function updateUrls() {
    try {
        // Update poetry collection
        const poetryResults = await poetryModel.updateMany(
            {
                $or: [
                    { image: { $regex: '^http://' } },
                    { audio: { $regex: '^http://' } }
                ]
            },
            [
                {
                    $set: {
                        image: {
                            $replaceOne: {
                                input: "$image",
                                find: "http://",
                                replacement: "https://"
                            }
                        },
                        audio: {
                            $replaceOne: {
                                input: "$audio",
                                find: "http://",
                                replacement: "https://"
                            }
                        }
                    }
                }
            ]
        );

        // Update gallery collection
        const galleryResults = await galleryModel.updateMany(
            { url: { $regex: '^http://' } },
            [
                {
                    $set: {
                        url: {
                            $replaceOne: {
                                input: "$url",
                                find: "http://",
                                replacement: "https://"
                            }
                        }
                    }
                }
            ]
        );

        console.log('Poetry collection update results:', poetryResults);
        console.log('Gallery collection update results:', galleryResults);
        console.log('URL updates completed successfully!');
    } catch (error) {
        console.error('Error updating URLs:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Run the update
updateUrls();
