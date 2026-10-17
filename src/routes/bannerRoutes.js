const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { payloadValidation } = require('../middleware/payloadValidation');
const { addVideoSchema } = require('../schemas/videoSchema');
const { addBannerController, getBannerController, deleteBannerController } = require('../controllers/bannerController');
const { addBannnerFiles, uploadHostfiles } = require('../middleware/uploadFiles');

const bannerRoutes = express.Router();
bannerRoutes.post('/add',
    authMiddleware,
    addBannnerFiles,
    uploadHostfiles,
    addBannerController)
bannerRoutes.get('/get',  getBannerController)
bannerRoutes.put('/delete/:id', authMiddleware, deleteBannerController)

module.exports = { bannerRoutes };