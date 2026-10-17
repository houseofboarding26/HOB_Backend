const { DataTypes } = require('sequelize');
const { getSequelize } = require('../config/db');

let Payment = null;

const initializePaymentModel = () => {
    const sequelize = getSequelize();

    if (sequelize.models?.Payment) {
        Payment = sequelize.models.Payment;
        return Payment;
    }

    Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        bookingId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Bookings",
                key: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        amount: {
             type: DataTypes.DECIMAL(12, 3),
            allowNull: false
        },
        amountSummary: {
            type: DataTypes.JSON(),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'created'
        },
        orderId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    const BookingModel = sequelize.models?.Bookings;
    if (BookingModel) {
        if (!Payment.associations?.booking) {
            Payment.belongsTo(BookingModel, {
                foreignKey: 'bookingId',
                targetKey: 'id',
                as: 'booking'
            });
        }

        if (!BookingModel.associations?.payments) {
            BookingModel.hasMany(Payment, {
                foreignKey: 'bookingId',
                sourceKey: 'id',
                as: 'payments'
            });
        }
    }

    return Payment;
};

const getPaymentModel = () => {
    if (!Payment) {
        return initializePaymentModel();
    }
    return Payment;
};

module.exports = { getPaymentModel, initializePaymentModel };