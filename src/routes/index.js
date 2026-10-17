const express = require('express');
const authRoutes = require('./authRoutes');
const { userRouter } = require('./useRoutes');
const { customerRouter } = require('./customerRoutes');
const { hostRoutes } = require('./hostRoutes');
const { petProfileRoutes } = require('./petProfileRoutes');
const { bookingRoutes } = require('./bookingRoutes');
const { paymentRoutes } = require('./paymentRouter');
const { videoRoutes } = require('./videoRoutes');
const { bannerRoutes } = require('./bannerRoutes');

const Router = express.Router();

Router.use('/auth', authRoutes);
Router.use('/users', userRouter);
Router.use('/customers', customerRouter);
Router.use('/host', hostRoutes);
Router.use('/petProfile', petProfileRoutes);
Router.use('/bookings', bookingRoutes);
Router.use('/payment', paymentRoutes);
Router.use('/videos', videoRoutes);
Router.use('/banners', bannerRoutes);

module.exports = Router;