const { addCustomerService } = require("../services/customerService");
const { addUser, getUsers: getUsersService, getUserById: getUserByIdService, updateUser: updateUserService, getUserByEmailService } = require("../services/userService");
const { expiresIn } = require("./authController");
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn } 
    );
};

const getUsers = async (req, res) => {
    try {
        const { page, limit, name, email, hostStatus, role } = req.query;
        const users = await getUsersService(page, limit, name, email, hostStatus, role);
        res.json({ users });
    } catch (error) {
        console.error('Error in getUsers:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await getUserByIdService(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Error in getUserById:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const postUsers = async (req, res) => {
    try {
        const useremail = await getUserByEmailService(req.body.email);
        if (useremail) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }
        const userId = await addUser(req.body);
        await addCustomerService({
            "userId": userId,
            "name": req.body.name,
            "email": req.body.email
        });
        const userdetails = await getUserByIdService(userId);
        const token = generateToken(userdetails);

        res.status(201).json({
            message: 'User created successfully',
            success: true,
            userId: userId,
            token: token,
            role: userdetails.role
        });
    } catch (error) {
        console.error('Error in postUsers:', error.message);
        return res.status(500).json({
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }

};

module.exports = { getUsers, getUserById, postUsers };