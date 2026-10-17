const mysql = require('mysql2/promise');
const { URL } = require('url');
require('dotenv').config();

const setupDatabase = async () => {
    try {
        const connectionUri = process.env.DB_URI;
        const uri = new URL(connectionUri);
        
        console.log('Connecting to database...');
        const connection = await mysql.createConnection(uri);

        console.log('✓ Connected!');

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id CHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL
            )
        `);

        console.log('✓ Users table created!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('✗ Setup failed:', error.message);
        process.exit(1);
    }
};

setupDatabase();
