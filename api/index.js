const app = require('../src/app');
const { initializePool, getSequelize } = require('../src/config/db');
const { initializePassport } = require('../src/config/passport');
const { initializeUser } = require('../src/models/User');
const { initiateSMTP, transporter } = require('../src/services/email/intiateSMTPConnetion');
const { tableInitializer } = require('../src/utils/tableInitializer');

let initialized = false;

module.exports = async (req, res) => {
    try {
        if (!initialized) {
            console.log('🔄 Initializing database and models...');

            await initializePool();
            console.log('✓ Database connection established');

            tableInitializer();
            console.log('✓ Models initialized');

            initializePassport();
            console.log('✓ Passport initialized');

            const sequelize = getSequelize();
            await sequelize.sync({ alter: process.env.NODE_ENV !== 'production', force: false });
            console.log('✓ Database synced');

            initialized = true;
        }

        return app(req, res);
    } catch (error) {
        console.error('❌ API Error:', error.message);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
};
