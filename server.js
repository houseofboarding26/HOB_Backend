const dotenv = require('dotenv');
const app = require('./src/app');
const { initializePool, getSequelize } = require('./src/config/db');
const { initializeUser } = require('./src/models/User');
const { initializePassport } = require('./src/config/passport');
const { tableInitializer } = require('./src/utils/tableInitializer');
const { initiateSMTP } = require('./src/services/email/intiateSMTPConnetion');

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        console.log('Initializing database connection...');
        await initializePool();
        console.log('✓ Database connection established');

        console.log('Initializing models...');
        tableInitializer();
        console.log('✓ Models initialized');

        console.log('Initializing Passport strategies...');
        initializePassport();
        console.log('✓ Passport initialized');

        console.log('Syncing models with database...');
        const sequelize = getSequelize();

        await sequelize.sync({
            force: false,  
            alter: process.env.NODE_ENV === 'development'  
        });
        console.log('✓ Database models synced');

        app.listen(PORT, () => {
            console.log(`✓ Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

startServer(); 

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    process.exit(0);
});


startServer();