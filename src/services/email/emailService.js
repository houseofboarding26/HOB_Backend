const { renderTemplate } = require("../../templates/templateService");
const { transporter } = require("./intiateSMTPConnetion");


const sendEmail = async ({
    to,
    subject,
    template,
    data
}) => {
    const html = renderTemplate(template, data);

    return transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
    });
};

const sendLoginNotificationEmail = async (user) => {
    return sendEmail({
        to: user.email,
        subject: "You signed in to your House of Boarding account",
        template: "account-login",
        data: {
            name: user.name,
        }
    });
};

const sendbookingConfirmationEmailtoCustomer = async (booking) => {
    return sendEmail({
        to: booking.email,
        subject: "Booking Confirmation",
        template: "booking-confirmation",
        data: {
            name: booking.username,
            bookingId: booking.bookingId,
            petnames: booking.petnames,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
        }
    });
};

const sendbookingConfirmationEmailtoHost = async (booking) => {
    return sendEmail({
        to: booking.email,
        subject: "New Booking Received",
        template: "host-booking-notification",
        data: {
            name: booking.username,
            guestName: booking.guestName,
            bookingId: booking.bookingId,
            petnames: booking.petnames,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            app_url: 'https://www.houseofboarding.com'
        }
    });
};

const sendBookingCancellationEmailToCustomer = async (booking) => {
    return sendEmail({
        to: booking.email,
        subject: "Your House of Boarding booking was cancelled",
        template: "booking-cancellation-customer",
        data: {
            name: booking.name,
            bookingId: booking.bookingId,
            petnames: booking.petnames,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            cancellationReason: booking.cancellationReason
        }
    });
};

const sendBookingCancellationEmailToHost = async (booking) => {
    return sendEmail({
        to: booking.email,
        subject: "A House of Boarding booking was cancelled",
        template: "booking-cancellation-host",
        data: {
            name: booking.name,
            guestName: booking.guestName,
            bookingId: booking.bookingId,
            petnames: booking.petnames,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            cancellationBy: booking.cancellationBy,
            cancellationReason: booking.cancellationReason
        }
    });
};


module.exports = {
    sendLoginNotificationEmail,
    sendbookingConfirmationEmailtoCustomer,
    sendbookingConfirmationEmailtoHost,
    sendBookingCancellationEmailToCustomer,
    sendBookingCancellationEmailToHost
};