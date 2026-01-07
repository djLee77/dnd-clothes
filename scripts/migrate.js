import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

(async () => {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });
        console.log('Connected to DB');
        try {
            await db.exec('ALTER TABLE scraps ADD COLUMN thumbnail TEXT');
            console.log('Added thumbnail column');
        } catch (e) {
            console.log('Column might already exist:', e.message);
        }
    } catch (e) {
        console.error('Migration failed:', e);
    }
})();
