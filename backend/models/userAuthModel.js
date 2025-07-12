const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
        type: String,
        minlength: 5,
        default: null,
    },

    profilePicture: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // Default avatar URL
    },
    isVerified: {
        type: Boolean,
        default: false, // Initially false, indicating the email is not verified
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'poetry'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.password) {
        return bcrypt.compare(candidatePassword, this.password);
    }
    return false; // No password for Google login
};

const User = mongoose.model("User", userSchema);

module.exports = User;
