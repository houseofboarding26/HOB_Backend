const mysql = require('mysql2/promise');
const { URL } = require('url');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Attempting connection with encoded URI...');
        
        const uri = process.env.DB_URI;
        
        
        const connection = await mysql.createConnection(uri);

        console.log('✓ Connected to Aiven MySQL database!');
        
        const [rows] = await connection.execute('SELECT 1');
        console.log('✓ Query successful:', rows);
        
        await connection.end();
    } catch (error) {
        console.error('✗ Connection failed:', error.message);
        console.error('Full error:', error);
    }
};

testConnection();
