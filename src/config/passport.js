const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User: getUser } = require('../models/User');
const { Customer: getCustomer } = require('../models/CustomerModel');

const getGoogleCallbackUrl = () => {
  const configuredUrl = process.env.GOOGLE_CALLBACK_URL || process.env.BASE_URL;

  if (!configuredUrl) {
    throw new Error('GOOGLE_CALLBACK_URL or BASE_URL must be set in production');
  }

  const callbackUrl = new URL(configuredUrl);
  callbackUrl.protocol = 'https:';

  if (!process.env.GOOGLE_CALLBACK_URL) {
    callbackUrl.pathname = '/api/auth/callback';
    callbackUrl.search = '';
    callbackUrl.hash = '';
  }

  return callbackUrl.toString();
};

const initializePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
          ? getGoogleCallbackUrl()
          : '/api/auth/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const User = getUser();
          const Customer = getCustomer();
          let user = await User.findOne({ where: { googleId: profile.id } });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
              avatar: profile.photos[0]?.value,
            });
            await Customer.create({
              "userId": user.id,
              "name": profile.displayName,
              "email": profile.emails[0].value
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const User = getUser();
      const user = await User.findByPk(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = { passport, initializePassport };