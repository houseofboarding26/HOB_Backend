const jwt = require('jsonwebtoken');
const {
    sendLoginNotificationEmail,
    sendPasswordResetOtpEmail
} = require('./../services/email/emailService');
const { getUserById, getUserByEmailService, updateUserPasswordService } = require('./../services/userService');
const { deletePasswordResetOtp, getPasswordResetOtp, savePasswordResetOtp } = require('../services/passwordResetOtpService');
const { createHash, randomInt } = require('crypto');

const expiresIn = '24h';
const OTP_EXPIRY_MS = 5 * 60 * 1000;

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, googleId: user.googleId },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

const loginController = async (req, res) => {
    try {
        const user = req.body;
        const userdetails = await getUserByEmailService(user.email);
        if (!userdetails) {
            return res.status(404).json({
                message: 'Authentication failed',
                error: error.message
            });
        }
        if (user.password != userdetails.password) {
            return res.status(400).json({
                message: 'Authentication failed',
                error: 'Invalid password'
            });
        }

        const token = generateToken(userdetails);

        return res.status(201).json({
            message: 'loged in successfully',
            success: true,
            userId: userdetails.id,
            token: token,
            role: userdetails.role
        });
    } catch (error) {
        res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
};

const sendOtpController = async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const userdetails = await getUserByEmailService(email.trim());
        if (!userdetails) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists for this email, an OTP has been sent'
            });
        }

        const otp = String(randomInt(100000, 1000000));
        const otpHash = createHash('sha256').update(otp).digest('hex');
        await savePasswordResetOtp(userdetails.email, otpHash);
        try {
            await sendPasswordResetOtpEmail(userdetails, otp);
        } catch (error) {
            await deletePasswordResetOtp(userdetails.email);
            throw error;
        }

        return res.status(200).json({
            success: true,
            message: 'OTP will expire in 5 minutes.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Unable to send verification OTP',
            error: error.message
        });
    }
};

const forgetPasswordController = async (req, res) => {
    try {
        const user = req.body;

        const submittedOtp = String(user.otp);
        if (
            typeof user.email !== 'string' ||
            !user.email.trim() ||
            !/^\d{6}$/.test(submittedOtp)
        ) {
            return res.status(400).json({
                success: false,
                message: 'A valid email and 6-digit OTP are required'
            });
        }

        const pendingOtp = await getPasswordResetOtp(user.email);
        if (!pendingOtp) {
            return res.status(400).json({
                success: false,
                message: 'OTP is missing or expired'
            });
        }

        if (Date.now() - new Date(pendingOtp.createdAt).getTime() >= OTP_EXPIRY_MS) {
            await deletePasswordResetOtp(user.email);
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        if (pendingOtp.attempts >= 5) {
            await deletePasswordResetOtp(user.email);
            return res.status(400).json({
                success: false,
                message: 'Too many invalid OTP attempts. Request a new code'
            });
        }

        const submittedOtpHash = createHash('sha256').update(submittedOtp).digest('hex');
        if (submittedOtpHash !== pendingOtp.otpHash) {
            pendingOtp.attempts += 1;
            if (pendingOtp.attempts >= 5) {
                await deletePasswordResetOtp(user.email);
            } else {
                await pendingOtp.save();
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (
            typeof user.newPassword !== 'string' ||
            user.newPassword.length < 6 ||
            typeof user.confirmPassword !== 'string'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (user.newPassword !== user.confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password does not match the confirmation'
            });
        }

        const userdetails = await getUserByEmailService(user.email.trim());
        if (!userdetails) {
            await deletePasswordResetOtp(user.email);
            return res.status(404).json({
                success: false,
                message: 'Authentication failed'
            });
        }

        await updateUserPasswordService(user.confirmPassword, userdetails.id);
        await deletePasswordResetOtp(user.email);

        return res.status(201).json({
            message: 'Password updated successfully',
            success: true,
            userId: userdetails.id
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
};

const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        const userdetails = await getUserById(user.dataValues.id);
        const token = generateToken(user);

        await sendLoginNotificationEmail(user);
        if (!req.query.state) {
            res.status(400).json({ message: 'Missing state parameter in the request' });
        }
        console.log('Login notification email sent.');
        const redirectUrl = req.query.state
            ? decodeURIComponent(req.query.state)
            : process.env.GOOGLE_REDIRECT_URL;

        res.redirect(
            `${redirectUrl}/?token=${encodeURIComponent(token)}&id=${encodeURIComponent(user.id)}&role=${encodeURIComponent(userdetails.role)}`
        );

    } catch (error) {
        res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = {
    generateToken,
    googleCallback,
    expiresIn,
    loginController,
    sendOtpController,
    forgetPasswordController
};