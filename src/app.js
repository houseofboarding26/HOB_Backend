const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const Router = require('./routes');

let passportInitialized = false;

const app = express();

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? `${process.env.BASE_URL}`
        : ['http://localhost:5173', 'http://localhost:3000'],
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