const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.azurecomm.net',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const initiateSMTP = async () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        throw new Error('SMTP_USER, SMTP_PASS, and EMAIL_FROM must be configured for Azure Communication Services SMTP.');
    }

    try {
        await transporter.verify();
        console.log('✓ Azure Communication Services SMTP connected');
    } catch (error) {
        console.error('Azure Communication Services SMTP connection failed:', error);
        throw error;
    }
};

module.exports = { initiateSMTP, transporter };