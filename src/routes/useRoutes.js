const express = require('express');
const { getUsers, getUserById, postUsers, updateUser, deleteUser } = require('../controllers/useController');
const { userSchema, userIDParamSchema } = require('../schemas/userSchema');
const { payloadValidation } = require('../middleware/payloadValidation');
const { userIDValidation } = require('../middleware/userIDValidation');
const authMiddleware = require('../middleware/authMiddleware');

const userRouter = express.Router();
userRouter.get('/get', authMiddleware, getUsers);
userRouter.get('/get/:id', authMiddleware, getUserById);
userRouter.post('/add', payloadValidation(userSchema), postUsers);

module.exports = { userRouter };