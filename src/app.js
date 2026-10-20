const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const Router = require('./routes');

let passportInitialized = false;

const app = express();

app.set('trust proxy', 1);

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '');
const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
const allowedOrigins = new Set([
    ...configuredOrigins,
    ...(process.env.BASE_URL ? [normalizeOrigin(process.env.BASE_URL)] : []),
    ...(process.env.NODE_ENV !== 'production'
        ? ['http://localhost:5173', 'http://localhost:3000']
        : [
            'https://www.houseofboarding.com', 
            'https://houseofboarding.com',
            'https://hob-backend-pearl.vercel.app',
            'https://hob-frontend-plum.vercel.app'
        ]),
]);

app.use(cors({
    origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.has(normalizeOrigin(origin)));
    },
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    if (!passportInitialized) {
        try {
            const { initializePassport } = require('./config/passport');
            initializePassport();
            passportInitialized = true;
            console.log('✓ Passport initialized');
        } catch (error) {
            console.error('Error initializing passport:', error);
        }
    }
    next();
});

app.get('/health', (req, res) => {
    res.json({
        status: 'UP'
    });
});

app.use('/api', Router)


module.exports = app;