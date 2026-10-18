const { Client } = require('pg');
require('dotenv').config();

const testConnection = async () => {
    try {
        const connectionUri = process.env.DATABASE_URL || process.env.DB_URI;

        if (!connectionUri) {
            throw new Error('No DATABASE_URL or DB_URI found in environment variables');
        }

        const sanitizedUri = connectionUri.replace(/[?&]sslmode=[^&]+/gi, '');
        const client = new Client({
            connectionString: sanitizedUri,
            ssl: sanitizedUri.includes('aivencloud.com') || sanitizedUri.includes('render.com') || sanitizedUri.includes('railway.app') ? { rejectUnauthorized: false } : false
        });

        await client.connect();
        const result = await client.query('SELECT 1 AS ok');
        console.log('✓ PostgreSQL connected successfully:', result.rows);
        await client.end();
    } catch (error) {
        console.error('✗ Connection failed:', error.message);
        console.error('Full error:', error);
    }
};

testConnection();
