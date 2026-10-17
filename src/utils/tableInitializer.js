const { initializeBooking } = require('../models/bookingModel');
const { initializeCustomer } = require('../models/CustomerModel');
const { initializeHost } = require('../models/HostModel');
const { initializeHostHolidayModel } = require('../models/HostHolidayModel');
const { initializePaymentModel } = require('../models/paymentModel');
const { initializePetProfileModel } = require('../models/petProfileModel');
const { initializeUser } = require('../models/User');
const { initializevideosModel } = require('../models/videoModel');
const { initializeBannersModel } = require('../models/BannersModel');

function tableInitializer() {
    initializeUser();
    initializeCustomer();
    initializeHost();
    initializePaymentModel();
    initializePetProfileModel();
    initializeBooking();
    initializeHostHolidayModel();
    initializevideosModel();
    initializeBannersModel();
}

module.exports = { tableInitializer };