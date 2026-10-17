const { Op } = require("sequelize");
const { getPaymentModel } = require("../models/paymentModel");

const addPaymentService = async (paymentData) => {
    const Payment = getPaymentModel();
    const newPayment = await Payment.create(paymentData);
    return newPayment;
}

const updatePaymentService = async (orderId, updateData) => {
    const Payment = getPaymentModel();
    const [updatedRows] = await Payment.update(updateData, {
        where: { orderId: orderId }
    });
    return updatedRows;
}

// ************ for admin use only ***********
const getAllPaymentsService = async (
    page = 1,
    limit = 10,
    orderId = '',
    paymentId = '',
    bookingId = '',
    status = ''
) => {
    const Payment = getPaymentModel();
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const offset = (page - 1) * limit;

     const where = {};
        if (orderId) {
            where.orderId = { [Op.like]: `%${orderId}%` };
        }

        if (paymentId) {
            where.paymentId = { [Op.like]: `%${paymentId}%` };
        }

        if (bookingId) {
            where.bookingId = { [Op.like]: `%${bookingId}%` };
        }

        if (status) {
            where.status = { [Op.like]: `%${status}%` };
        }

    const { count, rows } = await Payment.findAndCountAll({
        where,
        limit,
        order: [['createdAt', 'DESC']],
        offset
    });

    return {
        data: rows,
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit)
    };
};

module.exports = {
    addPaymentService,
    updatePaymentService,
    getAllPaymentsService
};