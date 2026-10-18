const { Sequelize } = require('sequelize');
const pg = require('pg');
const { URL } = require('url');
require('dotenv').config();

const uri = process.env.DATABASE_URL || process.env.DB_URI;
if (!uri) {
    console.error('✗ DATABASE_URL or DB_URI environment variable is not set');
}

const globalForSequelize = globalThis;
const sequelizeKey = '__HOB_POSTGRES_SEQUELIZE__';

let sequelize = globalForSequelize[sequelizeKey] || null;
let initializingPromise = null;

const parseConnectionUri = (uri) => {
    const sanitizedUri = uri.replace(/[?&]sslmode=[^&]+/gi, '');
    const url = new URL(sanitizedUri);
    const isRemote = url.hostname.includes('aivencloud.com') || url.hostname.includes('render.com') || url.hostname.includes('railway.app');

    return {
        host: url.hostname,
        username: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: parseInt(url.port, 10) || 5432,
        dialect: 'postgres',
        dialectModule: pg,
        pool: {
            max: 2,
            min: 0,
            acquire: 10000,
            idle: 5000,
            evict: 5000,
        },
        logging: false,
        dialectOptions: {
            ssl: isRemote ? { rejectUnauthorized: false } : false
        }
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
            globalForSequelize[sequelizeKey] = sequelize;

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