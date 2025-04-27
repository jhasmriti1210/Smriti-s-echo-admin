const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userAuthModel'); // Assuming your User model is here

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Make sure this URL matches your Google Developer Console configuration
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists in the database
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
            // If the user doesn't exist, create a new user
            user = new User({
                fullName: profile.displayName,
                email: profile.emails[0].value,
                password: null, // No password for Google login
            });
            await user.save();
        }
        return done(null, user);
    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

module.exports = passport;
