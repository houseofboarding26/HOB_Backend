const { addCustomerService, getCustomersService, getCustomerByIdService } = require("../services/customerService");


const addCustomer = async (req, res) => {
    const  userId  = req.user.id;
    req.body.userId = userId;
    try {
        const customerId = await addCustomerService(req.body);
        res.status(201).json({
            message: 'Customer created successfully',
            success: true,
            customerId: customerId
        });
    } catch (error) {
        console.error('Error in addCustomer Controller:', error);
        res.status(500).json({
            message: 'Error creating customer',
            success: false,
            error: error.message
        });
    }
}

const getCustomers = async (req, res) => {
    try {
        const { page, limit, name, email } = req.query;
        const customers = await getCustomersService(page, limit, name, email);
        res.status(200).json({ success: true, customers: customers });
    } catch (error) {
        console.error('Error in getCustomers Controller:', error);
        res.status(500).json({
            message: 'Error fetching customers',
            success: false,
            error: error.message
        });
    }
}

const getCustomerById = async (req, res) => {
    try {
        const customerId = req.params.id;
        const customer = await getCustomerByIdService(customerId);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.status(200).json({ success: true, customer: customer });
    } catch (error) {
        console.error('Error in getCustomerById Controller:', error.message);
        res.status(500).json({
            message: 'Error fetching customer',
            success: false,
            error: error.message
        });
    }
}

module.exports = { addCustomer, getCustomers, getCustomerById };