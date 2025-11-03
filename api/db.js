const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 
        `postgres://${process.env.NILEDB_USER}:${process.env.NILEDB_PASSWORD}@${process.env.NILEDB_HOST}:${process.env.NILEDB_PORT}/${process.env.NILEDB_NAME}`,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Connected to Nile Database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Helper function to execute queries
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Query executed', { duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

module.exports = {
    query,
    pool
};
