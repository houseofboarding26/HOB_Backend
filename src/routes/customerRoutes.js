const express = require('express');
const { payloadValidation } = require('../middleware/payloadValidation');
const authMiddleware = require('../middleware/authMiddleware');
const { createCustomerSchema } = require('../schemas/customerSchema');
const { getCustomerById, addCustomer, getCustomers } = require('../controllers/customerController');

const customerRouter = express.Router();
customerRouter.get('/get/:id', authMiddleware, getCustomerById);
customerRouter.post('/add',authMiddleware,  payloadValidation(createCustomerSchema), addCustomer);
customerRouter.get('/get',  authMiddleware, getCustomers);

module.exports = { customerRouter };