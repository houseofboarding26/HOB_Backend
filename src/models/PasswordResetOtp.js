const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let PasswordResetOtp = null;

const initializePasswordResetOtp = () => {
    const sequelize = getSequelize();

    PasswordResetOtp = sequelize.define('PasswordResetOtp', {
        email: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
        otpHash: {
            type: DataTypes.STRING(64),
            allowNull: false
        },
        attempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false
    });

    return PasswordResetOtp;
};

const getPasswordResetOtpModel = () => {
    if (!PasswordResetOtp) {
        return initializePasswordResetOtp();
    }
    return PasswordResetOtp;
};

module.exports = { PasswordResetOtp: getPasswordResetOtpModel, initializePasswordResetOtp };
