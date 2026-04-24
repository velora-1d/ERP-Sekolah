const { Client } = require('pg');
require('dotenv').config({ path: '.env.production' });

async function testConnection() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log('Connecting to:', process.env.DATABASE_URL.split('@')[1]);
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT NOW()');
        console.log('Server time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.message);
    }
}

testConnection();
