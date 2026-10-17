const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { userIDParamSchema } = require('../schemas/userSchema');
const { payloadValidation } = require('../middleware/payloadValidation');
const { createBookingSchema } = require('../schemas/bookingSchema');
const { getBookingByIdController, postBookingController, getBookingController, updateBookingStatusController, cancelBookingController, getAllBookingsController, getAllBookingsOfHostController } = require('../controllers/bookingController');
const { AdminRoleCheck } = require('../middleware/RoleCHeck');

const bookingRoutes = express.Router();
bookingRoutes.get('/get', authMiddleware, getBookingController);
bookingRoutes.get('/get/:id', authMiddleware, getBookingByIdController);
bookingRoutes.post('/add', authMiddleware, payloadValidation(createBookingSchema), postBookingController);
bookingRoutes.put('/cancel/:id', authMiddleware, cancelBookingController);

// to update the status of booking by CRON
bookingRoutes.get('/update/status-job', updateBookingStatusController);

//for admin use only
bookingRoutes.get('/admin/get', authMiddleware, AdminRoleCheck, getAllBookingsController);
bookingRoutes.get('/admin/get_a_host_bookings/:hostId', authMiddleware, AdminRoleCheck, getAllBookingsOfHostController);

module.exports = { bookingRoutes };