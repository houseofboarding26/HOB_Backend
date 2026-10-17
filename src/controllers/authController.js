const jwt = require('jsonwebtoken');
const { sendHostApprovedEmail } = require('./../services/email/emailService');
const { getUserById, getUserByEmailService, updateUserPasswordService } = require('./../services/userService');

const expiresIn = '24h';

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

const forgetPasswordController = async (req, res) => {
    const OTP = "123456"
    try {
        const user = req.body;
        if (OTP !== user.otp) {
            return res.status(404).json({
                success: false,
                message: 'Invalid OTP',
            });
        }
        const userdetails = await getUserByEmailService(user.email);
        if (!userdetails) {
            return res.status(404).json({
                success: false,
                message: 'Authentication failed',
            });
        }
        if (user.newPassword !== user.confirmPassword) {
            return res.status(404).json({
                success: false,
                message: 'new password doest not match with conform password',
            });
        }
        await updateUserPasswordService(user.confirmPassword, userdetails.id)

        return res.status(201).json({
            message: 'password updated successfully',
            success: true,
            userId: userdetails.id,
        });
    } catch (error) {
        res.status(500).json({
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

        await sendHostApprovedEmail(user);
        if (!req.query.state) {
            res.status(400).json({ message: 'Missing state parameter in the request' });
        }
        console.log('Host approved email sent to:', req.query.state);
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

module.exports = { generateToken, googleCallback, expiresIn, loginController, forgetPasswordController };