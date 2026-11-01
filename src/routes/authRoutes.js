const express = require('express');
const passport = require('passport');
const {
    googleCallback,
    loginController,
    sendOtpController,
    forgetPasswordController
} = require('../controllers/authController');

const authRoutes = express.Router();

authRoutes.get('/google', (req, res, next) => {
    const redirectUrl = req.query.redirectUrl;

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        state: encodeURIComponent(redirectUrl)
    })(req, res, next);
});

authRoutes.get('/callback',
    passport.authenticate('google', { failureRedirect: '/api/auth/login-failed' }),
    googleCallback
);

authRoutes.post('/login', loginController)
authRoutes.post('/send-otp', sendOtpController);
authRoutes.put('/forgetpassword', forgetPasswordController)


module.exports = authRoutes;