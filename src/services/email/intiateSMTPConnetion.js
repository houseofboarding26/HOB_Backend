const { success } = require("zod");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const initiateSMTP = async () => {
    try {
        await transporter.verify((error, success) => {
            if (error) console.error(`SMTP Connection Error : `, error)
            if (success) console.log("✓ SMTP Connected");
        })
    } catch (err) {
        console.error(`SMTP connection intiation failed : `, err);
    }
};

module.exports = { initiateSMTP, transporter }