const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let existingUser = await User.findOne({ googleId: profile.id });
    
    if (existingUser) {
      // Update user info if needed
      existingUser.name = profile.displayName;
      existingUser.avatar = profile.photos[0]?.value;
      await existingUser.save();
      return done(null, existingUser);
    }

    // Extract email domain for university validation
    const email = profile.emails[0]?.value;
    const emailDomain = email?.split('@')[1];
    
    // Create new user
    const newUser = new User({
      googleId: profile.id,
      email: email,
      name: profile.displayName,
      avatar: profile.photos[0]?.value,
      role: 'Student',
      university: emailDomain?.includes('.edu') ? emailDomain : null,
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
