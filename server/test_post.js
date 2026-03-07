import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dnd_closet',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

(async () => {
    try {
        console.log('Testing connection & insert into posts...');
        const result = await pool.query(
            'INSERT INTO posts (user_id, title, content, tags, thumbnail, scrap_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [1, 'test', 'test content', '[]', null, '[]']
        );
        console.log(result.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
})();
