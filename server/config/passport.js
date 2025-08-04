const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Extract email and validate domain
    const email = profile.emails[0]?.value;
    
    if (!email) {
      return done(new Error('No email found in Google profile'), null);
    }
    
    const emailDomain = email.split('@')[1];
    
    // Only allow PSG Tech emails
    if (emailDomain !== 'psgtech.ac.in') {
      return done(new Error('Access restricted to PSG Tech students only. Please use your PSG Tech email address.'), null);
    }
    
    // Check if user already exists
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      // Update user info if needed
      existingUser.name = profile.displayName;
      existingUser.avatar = profile.photos[0]?.value;
      existingUser.email = email; // Update email in case it changed
      await existingUser.save();
      return done(null, existingUser);
    }

    // Create new user
    const newUser = new User({
      googleId: profile.id,
      email: email,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      role: 'Student',
      university: 'PSG College of Technology',
      isEmailVerified: true,
      joinedAt: new Date()
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    // console.error('Error in Google Strategy:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
