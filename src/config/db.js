const { Sequelize } = require('sequelize');
const { URL } = require('url');
require('dotenv').config();

const uri = process.env.DATABASE_URL || process.env.DB_URI;
if (!uri) {
    console.error('✗ DATABASE_URL or DB_URI environment variable is not set');
}

let sequelize = null;
let initializingPromise = null;

const parseConnectionUri = (uri) => {
    const url = new URL(uri);
    return {
        host: url.hostname,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: parseInt(url.port, 10),
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            supportBigNumbers: true,
            bigNumberStrings: true
        },
        logging: false
    };
};

const initializePool = async () => {
    if (initializingPromise) {
        return initializingPromise;
    }

    if (sequelize) {
        return sequelize;
    }

    initializingPromise = (async () => {
        try {
            if (!uri) {
                throw new Error('DATABASE_URL or DB_URI environment variable is not set');
            }
            const config = parseConnectionUri(uri);
            sequelize = new Sequelize(config);
            
            await sequelize.authenticate();
            console.log('✓ Database connection established successfully');
            return sequelize;
        } catch (error) {
            console.error('✗ Failed to initialize database connection:', error.message);
            initializingPromise = null; 
            throw error;
        }
    })();

    return initializingPromise;
};

const getSequelize = () => {
    if (!sequelize) {
        throw new Error('Database connection not initialized. Call initializePool() first.');
    }
    return sequelize;
};

module.exports = { initializePool, getSequelize, sequelize: () => getSequelize() };