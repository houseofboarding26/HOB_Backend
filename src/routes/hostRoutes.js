const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getHostById, getHosts, postHosts, getHostsforAdmin, putHosts, putHostProperty, updateHostHolidayStatusService } = require('../controllers/hostController');
const { payloadValidation } = require('../middleware/payloadValidation');
const { createHostSchema, adminUpdateHostSchema, updateHostSchema } = require('../schemas/hostSchema');
const { upload } = require('../middleware/upload');
const { uploadHostfiles, handleHostUpload, updateHostFiles } = require('../middleware/uploadFiles');
const { checkForHost } = require('../middleware/checkForHost');
const { getHostHolidayByIdController, getHostHolidayController, postHostHolidayController } = require('../controllers/hostHolidayController');
const { createHostHolidaySchema } = require('../schemas/hostHolidaySchema');
const { HostRoleCheck, AdminRoleCheck, CustomerRoleCheck } = require('../middleware/RoleCHeck');

const hostRoutes = express.Router();

hostRoutes.get('/get', getHosts);
hostRoutes.get('/get/:id', getHostById);
hostRoutes.post('/add',
    authMiddleware,
    CustomerRoleCheck,
    handleHostUpload,
    checkForHost,
    payloadValidation(createHostSchema),
    uploadHostfiles,
    postHosts);
hostRoutes.put('/put/:id',
    authMiddleware,
    HostRoleCheck,
    updateHostFiles,

    payloadValidation(updateHostSchema),
    uploadHostfiles,
    putHostProperty);

// for Hsot Holiday (Admin and Host)
hostRoutes.get('/holiday/get', authMiddleware, HostRoleCheck, getHostHolidayController);
hostRoutes.get('/holiday/get/:id', authMiddleware, HostRoleCheck, getHostHolidayByIdController);
hostRoutes.post('/holiday/add', authMiddleware, HostRoleCheck, payloadValidation(createHostHolidaySchema), postHostHolidayController);

// host Holiday status update by CRON
hostRoutes.get('/holiday/update/status-job', updateHostHolidayStatusService);

// for Admin use Only
hostRoutes.get('/admin/get', authMiddleware, AdminRoleCheck, getHostsforAdmin);
hostRoutes.put('/admin/put/:id', authMiddleware, AdminRoleCheck, payloadValidation(adminUpdateHostSchema), putHosts);

module.exports = { hostRoutes };