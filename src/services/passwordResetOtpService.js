const { PasswordResetOtp: getPasswordResetOtpModel } = require('../models/PasswordResetOtp');

const savePasswordResetOtp = async (email, otpHash) => {
    const PasswordResetOtp = getPasswordResetOtpModel();
    await PasswordResetOtp.upsert({
        email: email.trim().toLowerCase(),
        otpHash,
        attempts: 0,
        createdAt: new Date()
    });
};

const getPasswordResetOtp = async (email) => {
    const PasswordResetOtp = getPasswordResetOtpModel();
    return PasswordResetOtp.findByPk(email.trim().toLowerCase());
};

const deletePasswordResetOtp = async (email) => {
    const PasswordResetOtp = getPasswordResetOtpModel();
    await PasswordResetOtp.destroy({
        where: { email: email.trim().toLowerCase() }
    });
};

module.exports = { savePasswordResetOtp, getPasswordResetOtp, deletePasswordResetOtp };
