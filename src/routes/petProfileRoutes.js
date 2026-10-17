const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { getPetProfileByIdController, postPetProfileController, getPetProfileController, updatePetProfileController } = require('../controllers/petProfileController');
const { payloadValidation } = require('../middleware/payloadValidation');
const { updatePetProfileSchema, createPetProfileSchema } = require('../schemas/petProfileSchema');

const petProfileRoutes = express.Router();
petProfileRoutes.get('/get/:id', authMiddleware, getPetProfileByIdController);
petProfileRoutes.post('/add', authMiddleware, payloadValidation(createPetProfileSchema), postPetProfileController);
petProfileRoutes.get('/get', authMiddleware, getPetProfileController);
petProfileRoutes.put('/update/:petProfileId', authMiddleware, payloadValidation(updatePetProfileSchema), updatePetProfileController);

module.exports = { petProfileRoutes };