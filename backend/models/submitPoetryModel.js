const mongoose = require("mongoose");

const PoetrySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    poetryText: {
        type: String,
        required: true,
    },
    audio: {
        type: String, // This is the path to the audio file (if any)
        default: null,
    },
});

const Poetry = mongoose.model("UsersSubmittedPoetry", PoetrySchema);

module.exports = Poetry;
