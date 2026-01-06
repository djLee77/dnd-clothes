import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database initialization
let db;
(async () => {
    try {
        db = await open({
            filename: process.env.DB_PATH || './database.sqlite',
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                username TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS scraps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                categoryId INTEGER NOT NULL,
                src TEXT NOT NULL,
                name TEXT,
                price TEXT,
                siteUrl TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (categoryId) REFERENCES categories (id)
            )
        `);
        console.log('Connected to SQLite database');
    } catch (err) {
        console.error('Database initialization failed:', err);
    }
})();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Authentication failed: No token provided');
        return res.sendStatus(401);
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Authentication failed: Invalid token');
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// --- Routes ---

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run('INSERT INTO users (email, password, username) VALUES (?, ?, ?)', [email, hashedPassword, username]);
        const token = jwt.sign({ userId: result.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User registered successfully', token, user: { id: result.lastID, email, username } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, email, username FROM users WHERE id = ?', [req.user.userId]);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user context' });
    }
});

// Scrap routes
app.get('/api/scraps', authenticateToken, async (req, res) => {
    try {
        const scraps = await db.all('SELECT id, name, created_at FROM scraps WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
        res.json(scraps);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scraps' });
    }
});

app.get('/api/scraps/:id', authenticateToken, async (req, res) => {
    try {
        const scrap = await db.get('SELECT * FROM scraps WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        if (!scrap) return res.status(404).json({ error: 'Scrap not found' });
        res.json(scrap);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scrap' });
    }
});

app.post('/api/scraps', authenticateToken, async (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'Name and data are required' });

    try {
        const result = await db.run('INSERT INTO scraps (user_id, name, data) VALUES (?, ?, ?)', [req.user.userId, name, JSON.stringify(data)]);
        res.status(201).json({ id: result.lastID, name, message: 'Scrap saved successfully' });
    } catch (err) {
        console.error('Error saving scrap:', err);
        res.status(500).json({ error: 'Failed to save scrap' });
    }
});

// Category routes
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await db.all('SELECT * FROM categories WHERE user_id = ?', [req.user.userId]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const result = await db.run('INSERT INTO categories (user_id, name) VALUES (?, ?)', [req.user.userId, name]);
        res.status(201).json({ id: result.lastID, name });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        // Also delete assets in this category? 
        // For simplicity, let's just delete the category. Or prevent deletion if assets exist.
        // Let's delete assets too for a clean removal.
        await db.run('DELETE FROM assets WHERE categoryId = ? AND user_id = ?', [req.params.id, req.user.userId]);
        await db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        res.json({ message: 'Category and its assets deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Asset routes
app.get('/api/assets', authenticateToken, async (req, res) => {
    try {
        const assets = await db.all('SELECT * FROM assets WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

app.post('/api/assets', authenticateToken, async (req, res) => {
    const { categoryId, src, name, price, siteUrl } = req.body;
    if (!categoryId || !src) return res.status(400).json({ error: 'CategoryId and src are required' });
    try {
        const result = await db.run(
            'INSERT INTO assets (user_id, categoryId, src, name, price, siteUrl) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.userId, categoryId, src, name, price, siteUrl]
        );
        res.status(201).json({ id: result.lastID, categoryId, src, name, price, siteUrl });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save asset' });
    }
});

app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
    try {
        await db.run('DELETE FROM assets WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
        res.json({ message: 'Asset deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete asset' });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.log(`404 - API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
