const { z } = require('zod');

const userSchema = z.object({
    name: z.string().min(3, 'Name is required').max(50, 'Name must be less than 50 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const forgetPasswordSchema = z.object({
    email: z.email('Invalid email address'),
    otp: z.string().min(6, 'OTP can not less than 6 digit').max(6, 'OTP can not more than 6 digit'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

const userIDParamSchema = z.string().uuid('User ID must be a valid UUID');

module.exports = { userSchema, userIDParamSchema };