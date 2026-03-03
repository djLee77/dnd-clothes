import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very simple in-memory store for verification codes
// In production, this should ideally be in Redis or DB with an expiration time
const verificationCodes = new Map();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS,  // Your Gmail App Password
    }
});

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
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dnd_closet',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

(async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                username TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS scraps (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id),
                name TEXT NOT NULL,
                data TEXT NOT NULL,
                thumbnail TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        try {
            await pool.query('ALTER TABLE scraps ADD COLUMN thumbnail TEXT');
        } catch (e) {
            // Column already exists
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id),
                name TEXT NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id),
                "categoryId" INTEGER NOT NULL REFERENCES categories (id),
                src TEXT NOT NULL,
                name TEXT,
                price TEXT,
                "siteUrl" TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Connected to PostgreSQL database');
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
        const result = await pool.query('INSERT INTO users (email, password, username) VALUES ($1, $2, $3) RETURNING id', [email, hashedPassword, username]);
        const userId = result.rows[0].id;
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User registered successfully', token, user: { id: userId, email, username } });
    } catch (err) {
        if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint')) return res.status(400).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Invalid email or password' });
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, username: user.username } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to login' });
    }
});

app.post('/api/auth/send-code', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: '이메일을 입력해주세요.' });

    try {
        // Check if user exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: '등록되지 않은 이메일입니다.' });
        }

        // Generate a 6-digit verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with expiration (10 minutes)
        verificationCodes.set(email, {
            code,
            expiresAt: Date.now() + 10 * 60 * 1000
        });

        // Send Email
        const mailOptions = {
            from: process.env.EMAIL_USER || 'no-reply@wardrobe.com',
            to: email,
            subject: '[Wardrobe] 비밀번호 재설정 인증 코드',
            text: `안녕하세요.\n\n비밀번호 재설정을 위한 인증 코드는 다음과 같습니다:\n\n[ ${code} ]\n\n이 코드는 10분 동안 유효합니다.\n\n감사합니다.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">비밀번호 재설정 안내</h2>
                    <p style="color: #555; line-height: 1.6;">안녕하세요.</p>
                    <p style="color: #555; line-height: 1.6;">요청하신 비밀번호 재설정을 위한 6자리 인증 코드입니다.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #000; margin: 20px 0; border-radius: 5px;">
                        ${code}
                    </div>
                    <p style="color: #888; font-size: 13px; text-align: center;">이 코드는 발급 후 10분 동안만 유효합니다.</p>
                </div>
            `
        };

        // Try to send email. If Env vars are not set, just simulate it for development
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log(`\n\n[DEV MODE] Email simulation for ${email}`);
            console.log(`[DEV MODE] Verification Code: ${code}\n\n`);
            // We won't actually fail if EMAIL_USER wasn't set locally, to allow development testing
        }

        res.json({ message: '인증 코드가 이메일로 발송되었습니다.' });

    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ error: '이메일 발송에 실패했습니다. (서버 설정 확인 필요)' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: '이메일, 인증 코드, 새 비밀번호가 모두 필요합니다.' });

    try {
        const storedData = verificationCodes.get(email);

        if (!storedData) {
            return res.status(400).json({ error: '요청된 인증 코드가 없거나 만료되었습니다. 다시 코드를 발송해주세요.' });
        }

        if (Date.now() > storedData.expiresAt) {
            verificationCodes.delete(email);
            return res.status(400).json({ error: '인증 코드가 만료되었습니다. 다시 코드를 발송해주세요.' });
        }

        if (storedData.code !== code) {
            return res.status(400).json({ error: '인증 코드가 일치하지 않습니다.' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: '저장된 정보를 찾을 수 없습니다.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, user.id]);

        // Clear code after successful use
        verificationCodes.delete(email);

        res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '비밀번호 초기화에 실패했습니다.' });
    }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, username FROM users WHERE id = $1', [req.user.userId]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user context' });
    }
});

// Scrap routes
app.get('/api/scraps', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, thumbnail, created_at FROM scraps WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scraps' });
    }
});

app.get('/api/scraps/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scraps WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        const scrap = result.rows[0];
        if (!scrap) return res.status(404).json({ error: 'Scrap not found' });
        res.json(scrap);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scrap' });
    }
});

app.post('/api/scraps', authenticateToken, async (req, res) => {
    const { name, data, thumbnail } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'Name and data are required' });

    try {
        const result = await pool.query('INSERT INTO scraps (user_id, name, data, thumbnail) VALUES ($1, $2, $3, $4) RETURNING id', [req.user.userId, name, JSON.stringify(data), thumbnail]);
        res.status(201).json({ id: result.rows[0].id, name, message: 'Scrap saved successfully' });
    } catch (err) {
        console.error('Error saving scrap:', err);
        res.status(500).json({ error: 'Failed to save scrap' });
    }
});

// Category routes
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories WHERE user_id = $1', [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    try {
        const result = await pool.query('INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id', [req.user.userId, name]);
        res.status(201).json({ id: result.rows[0].id, name });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM assets WHERE "categoryId" = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        await pool.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        res.json({ message: 'Category and its assets deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Asset routes
app.get('/api/assets', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, user_id, "categoryId", src, name, price, "siteUrl", created_at FROM assets WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
});

app.post('/api/assets', authenticateToken, async (req, res) => {
    const { categoryId, src, name, price, siteUrl } = req.body;
    if (!categoryId || !src) return res.status(400).json({ error: 'CategoryId and src are required' });
    try {
        const result = await pool.query(
            'INSERT INTO assets (user_id, "categoryId", src, name, price, "siteUrl") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [req.user.userId, categoryId, src, name, price, siteUrl]
        );
        res.status(201).json({ id: result.rows[0].id, categoryId, src, name, price, siteUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save asset' });
    }
});

app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM assets WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
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

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '../dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
