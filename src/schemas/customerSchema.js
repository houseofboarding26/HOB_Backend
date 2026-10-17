const { z } = require('zod');
const { behavioralIssues, PetTypes } = require('../config/pets');


const createCustomerSchema = z.object({
    name: z.string().min(2).max(100),
    contactNumber: z.string().max(15),
    email: z.string().email()
});

module.exports = { createCustomerSchema };