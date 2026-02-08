// Import pg with promise support
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        const result = await client.query('SELECT NOW()');
        console.log('📅 Database time:', result.rows[0].now);
        client.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

module.exports = { pool, testConnection };