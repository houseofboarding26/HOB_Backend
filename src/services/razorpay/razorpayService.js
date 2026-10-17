const razorpay = require("../../config/razorpay");

const createPaymentOrder = async ({
    amount,
    bookingId
}) => {
    try {
        const amountInPaise = Math.round(Number(amount) * 100);

        if (!amountInPaise || amountInPaise <= 0) {
            throw new Error('Invalid payment amount');
        }

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `booking_${bookingId}`.slice(0, 40),
            notes: {
                bookingId
            }
        };

        const order = await razorpay.orders.create(options);

        return order;
    } catch (error) {
        throw error;
    }
};

const fetchPaymentDetails = async (paymentId) => {
    try {
        if (!paymentId) {
            throw new Error('Payment ID is required to fetch payment details');
        }
        const paymentDetails = await razorpay.payments.fetch(paymentId);
        return paymentDetails;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error;
    }
}
module.exports = {
    createPaymentOrder,
    fetchPaymentDetails
};