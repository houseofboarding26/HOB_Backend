const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addVideoController, getvideoController, deletevideoController } = require('../controllers/videoController');
const { payloadValidation } = require('../middleware/payloadValidation');
const { addVideoSchema } = require('../schemas/videoSchema');

const videoRoutes = express.Router();
videoRoutes.post('/add', authMiddleware, payloadValidation(addVideoSchema), addVideoController)
videoRoutes.get('/get',  getvideoController)
videoRoutes.put('/delete/:id', authMiddleware, deletevideoController)

module.exports = { videoRoutes };