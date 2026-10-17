const express = require('express');
const { verifyPayment, createOrder, getAllPayments } = require('../controllers/paymentController');
const { AdminRoleCheck } = require('../middleware/RoleCHeck');
const authMiddleware = require('../middleware/authMiddleware');


const paymentRoutes = express.Router();
paymentRoutes.post('/create-order', createOrder);
paymentRoutes.post('/verify-payment', verifyPayment);

// *********** for admin use only ***********
paymentRoutes.get('/admin/get-all-payments', authMiddleware,
     AdminRoleCheck,
      getAllPayments);

module.exports = { paymentRoutes };