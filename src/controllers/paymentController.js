const crypto = require('crypto');
const { createPaymentOrder, fetchPaymentDetails } = require('../services/razorpay/razorpayService');
const { addPaymentService, updatePaymentService, getAllPaymentsService, getPaymentByPaymentIdService } = require('../services/paymentService');
const { getBookingByIdService } = require('../services/bookingService');
const { getPetProfileByIdService } = require('../services/petProfileService');
const { getUserById } = require('../services/userService');
const { sendbookingConfirmationEmailtoHost } = require('../services/email/emailService');
const { getHostByIdService } = require('../services/hostService');

const createOrder = async (req, res) => {
    try {
        const {
            amount,
            amountSummary,
            bookingId
        } = req.body;

        if (!amount && !amountSummary) {
            return res.status(400).json({
                success: false,
                message: 'Amount and amountSummary are required'
            });
        }
        const order = await createPaymentOrder({
            amount,
            bookingId
        });

        console.log('Payment order created:', amountSummary);

        await addPaymentService({
            orderId: order.id,
            bookingId,
            amount,
            amountSummary
        });

        res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                bookingId
            }
        });

    } catch (error) {
        console.error('Create payment order error:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to create payment order',
            error: error
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body =
            `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac(
                'sha256',
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        const payment = await fetchPaymentDetails(razorpay_payment_id);

        await updatePaymentService(razorpay_order_id, {
            paymentId: payment.id,
            status: payment.status
        });

        // email to customer
        const paymentDetails = await getPaymentByPaymentIdService(payment.id);
        const booking = await getBookingByIdService(paymentDetails.bookingId);
        const user = await getUserById(booking.userId);
        const petnames = [];
        const uniquePetIds = [...new Set(booking.petIds)];
        for (const petId of uniquePetIds) {
            const petProfile = await getPetProfileByIdService(petId);
            petnames.push(petProfile.petName);
        }
        await sendbookingConfirmationEmailtoCustomer({
            email: user.email,
            username: user.name,
            bookingId: booking.id,
            petnames: petnames.join(", "),
            checkIn: booking.checkIn,
            checkOut: booking.checkOut
        });

        // email for Host
        const host = await getHostByIdService(booking.hostId);
        const hostdata = await getUserById(host.userId);
        await sendbookingConfirmationEmailtoHost({
            email: hostdata.email,
            username: hostdata.name,
            guestName: user.name,
            bookingId: booking.id,
            petnames: petnames.join(", "),
            checkIn: booking.checkIn,
            checkOut: booking.checkOut
        });

        return res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: payment.id
        });

    } catch (error) {
        console.error('Payment verification error:', error);

        return res.status(500).json({
            success: false,
            message: 'Payment verification failed'
        });
    }
};

// ************ for admin use only ***********
const getAllPayments = async (req, res) => {
    try {
        const { page, limit,
            orderId,
            paymentId,
            bookingId,
            status
        } = req.query;
        const payments = await getAllPaymentsService(page, limit, orderId,
            paymentId,
            bookingId,
            status);
        return res.status(200).json({
            success: true,
            message: 'Payments fetched successfully',
            data: payments
        });
    }
    catch (error) {
        console.error('Error in getAllPayments controller:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    getAllPayments
};