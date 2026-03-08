import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very simple in-memory store for verification codes
// In production, this should ideally be in Redis or DB with an expiration time
const verificationCodes = new Map();

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
                profile_image TEXT,
                handle TEXT UNIQUE,
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add columns if they do not exist
        try {
            await pool.query('ALTER TABLE users ADD COLUMN profile_image TEXT');
        } catch (e) { }
        try {
            await pool.query('ALTER TABLE users ADD COLUMN handle TEXT UNIQUE');
        } catch (e) { }
        try {
            await pool.query('ALTER TABLE users ADD COLUMN bio TEXT');
        } catch (e) { }

        // Populate handles for existing users if any are empty
        try {
            const usersRes = await pool.query('SELECT id FROM users WHERE handle IS NULL');
            for (let u of usersRes.rows) {
                const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
                await pool.query('UPDATE users SET handle = $1 WHERE id = $2', [`#USER_${randomStr}`, u.id]);
            }

            // Fix any handles missing the '#' prefix
            await pool.query(`UPDATE users SET handle = '#' || handle WHERE handle NOT LIKE '#%'`);
        } catch (e) { console.error(e) }

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

        await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users (id),
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT,
                thumbnail TEXT,
                scrap_ids TEXT,
                views INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS post_likes (
                post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (post_id, user_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS post_comments (
                id SERIAL PRIMARY KEY,
                post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        try {
            await pool.query('ALTER TABLE posts ADD COLUMN thumbnail TEXT');
        } catch (e) {
            // Column already exists
        }

        try {
            await pool.query('ALTER TABLE post_comments ADD COLUMN parent_id INTEGER REFERENCES post_comments (id) ON DELETE CASCADE');
        } catch (e) {
            // Column already exists
        }

        try {
            await pool.query('ALTER TABLE post_comments ADD COLUMN likes INTEGER DEFAULT 0');
        } catch (e) {
            // Column already exists
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS comment_likes (
                comment_id INTEGER NOT NULL REFERENCES post_comments (id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (comment_id, user_id)
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

// Middleware to optionally verify JWT
const optionalAuthenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        }
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
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const handle = `#USER_${randomStr}`;
        const result = await pool.query('INSERT INTO users (email, password, username, handle) VALUES ($1, $2, $3, $4) RETURNING id', [email, hashedPassword, username, handle]);
        const userId = result.rows[0].id;
        const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ message: 'User registered successfully', token, user: { id: userId, email, username, handle, profile_image: null, bio: null } });
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
        res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, username: user.username, profile_image: user.profile_image, handle: user.handle, bio: user.bio } });
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
            expiresAt: Date.now() + 3 * 60 * 1000
        });

        // Email html content
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">비밀번호 재설정 안내</h2>
                <p style="color: #555; line-height: 1.6;">안녕하세요.</p>
                <p style="color: #555; line-height: 1.6;">요청하신 비밀번호 재설정을 위한 6자리 인증 코드입니다.</p>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #000; margin: 20px 0; border-radius: 5px;">
                    ${code}
                </div>
                <p style="color: #888; font-size: 13px; text-align: center;">이 코드는 발급 후 3분 동안만 유효합니다.</p>
            </div>
        `;

        if (process.env.BREVO_API_KEY && process.env.SENDER_EMAIL) {
            // Send via Brevo using Native fetch API
            try {
                const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                    method: 'POST',
                    headers: {
                        'accept': 'application/json',
                        'api-key': process.env.BREVO_API_KEY,
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        sender: {
                            name: "Wardrobe",
                            email: process.env.SENDER_EMAIL
                        },
                        to: [{ email: email }],
                        subject: '[Wardrobe] 비밀번호 재설정 인증 코드',
                        htmlContent: htmlContent
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Brevo API Error:', errorData);
                    return res.status(500).json({ error: '이메일 발송에 실패했습니다. (게이트웨이 에러)' });
                }
            } catch (error) {
                console.error('Brevo Request Error:', error);
                return res.status(500).json({ error: '이메일 발송에 실패했습니다. (네트워크 에러)' });
            }
        } else {
            if (process.env.NODE_ENV === 'production') {
                console.error('CRITICAL: BREVO_API_KEY or SENDER_EMAIL is not set in production environment!');
                return res.status(500).json({ error: '이메일 발송 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.' });
            }
            console.log(`\n\n[DEV MODE] Email simulation for ${email}`);
            console.log(`\n\n[DEV MODE] Note: BREVO_API_KEY and SENDER_EMAIL must be set in .env to send real emails.`);
            console.log(`[DEV MODE] Verification Code: ${code}\n\n`);
        }

        res.json({ message: '인증 코드가 이메일로 발송되었습니다.' });

    } catch (err) {
        console.error('Email send error:', err);
        res.status(500).json({ error: '이메일 발송 과정에서 오류가 발생했습니다.' });
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
        const result = await pool.query('SELECT id, email, username, profile_image, handle, bio FROM users WHERE id = $1', [req.user.userId]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user context' });
    }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    const { username, handle, bio, profile_image } = req.body;
    try {
        // Validation for handle format can be added here if necessary
        const result = await pool.query(
            'UPDATE users SET username = COALESCE($1, username), handle = COALESCE($2, handle), bio = COALESCE($3, bio), profile_image = COALESCE($4, profile_image) WHERE id = $5 RETURNING id, email, username, profile_image, handle, bio',
            [username, handle, bio, profile_image, req.user.userId]
        );
        res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } catch (err) {
        if (err.message.includes('unique constraint') || err.message.includes('UNIQUE constraint')) return res.status(400).json({ error: 'Handle already exists. Please choose another.' });
        console.error('Failed to update profile:', err);
        res.status(500).json({ error: 'Failed to update profile' });
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

app.delete('/api/scraps/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM scraps WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        res.json({ message: 'Scrap deleted successfully' });
    } catch (err) {
        console.error('Error deleting scrap:', err);
        res.status(500).json({ error: 'Failed to delete scrap' });
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

// Community Post Routes
app.get('/api/posts', async (req, res) => {
    try {
        // Does not require authentication to read posts
        const result = await pool.query(`
            SELECT p.*, u.username as author, u.profile_image as author_profile_image, u.handle as author_handle
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/api/posts/:id', optionalAuthenticateToken, async (req, res) => {
    try {
        // Increment view count
        await pool.query('UPDATE posts SET views = views + 1 WHERE id = $1', [req.params.id]);

        const result = await pool.query(`
            SELECT p.*, u.username as author, u.profile_image as author_profile_image, u.handle as author_handle
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const post = result.rows[0];
        const scrapIds = JSON.parse(post.scrap_ids || '[]');

        let scraps = [];
        if (scrapIds.length > 0) {
            const scrapsResult = await pool.query('SELECT * FROM scraps WHERE id = ANY($1::int[])', [scrapIds]);
            scraps = scrapsResult.rows;
        }

        let isLiked = false;
        if (req.user) {
            const likeResult = await pool.query('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
            if (likeResult.rows.length > 0) {
                isLiked = true;
            }
        }

        res.json({ post, scraps, isLiked });
    } catch (err) {
        console.error('Failed to fetch post details:', err);
        res.status(500).json({ error: 'Failed to fetch post details' });
    }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
    const { title, content, tags, scrapIds, thumbnail } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

    try {
        const result = await pool.query(
            'INSERT INTO posts (user_id, title, content, tags, thumbnail, scrap_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [req.user.userId, title, content, JSON.stringify(tags || []), thumbnail, JSON.stringify(scrapIds || [])]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Post created successfully' });
    } catch (err) {
        console.error('Failed to create post:', err);
        res.status(500).json({ error: 'Failed to create post' });
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Failed to delete post:', err);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Toggle Post Like
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.userId;

    try {
        // Check if like exists
        const likeResult = await pool.query('SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);

        let liked = false;
        if (likeResult.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
            await pool.query('UPDATE posts SET likes = likes - 1 WHERE id = $1', [postId]);
            liked = false;
        } else {
            // Like
            await pool.query('INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)', [postId, userId]);
            await pool.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);
            liked = true;
        }

        const updatedPost = await pool.query('SELECT likes FROM posts WHERE id = $1', [postId]);
        res.json({ liked, likes: updatedPost.rows[0].likes });
    } catch (err) {
        console.error('Failed to toggle like:', err);
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Get Post Comments
app.get('/api/posts/:id/comments', optionalAuthenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, u.username as author, u.profile_image as author_profile_image, u.handle as author_handle
            FROM post_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at ASC
        `, [req.params.id]);

        let comments = result.rows;

        if (req.user) {
            const userId = req.user.userId;
            const likesResult = await pool.query('SELECT comment_id FROM comment_likes WHERE user_id = $1', [userId]);
            const likedCommentIds = new Set(likesResult.rows.map(r => r.comment_id));

            comments = comments.map(c => ({
                ...c,
                isLiked: likedCommentIds.has(c.id)
            }));
        } else {
            comments = comments.map(c => ({ ...c, isLiked: false }));
        }

        res.json(comments);
    } catch (err) {
        console.error('Failed to fetch comments:', err);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// Add Post Comment
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    const { content, parent_id } = req.body;
    const postId = req.params.id;
    const userId = req.user.userId;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    try {
        await pool.query(
            'INSERT INTO post_comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4)',
            [postId, userId, content, parent_id || null]
        );

        // Update comments count on post
        await pool.query('UPDATE posts SET comments = comments + 1 WHERE id = $1', [postId]);

        const updatedPost = await pool.query('SELECT comments FROM posts WHERE id = $1', [postId]);

        res.status(201).json({ message: 'Comment added', comments: updatedPost.rows[0].comments });
    } catch (err) {
        console.error('Failed to add comment:', err);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Toggle Comment Like
app.post('/api/comments/:id/like', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.userId;

    try {
        // Check if like exists
        const likeResult = await pool.query('SELECT * FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);

        let liked = false;
        if (likeResult.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2', [commentId, userId]);
            await pool.query('UPDATE post_comments SET likes = likes - 1 WHERE id = $1', [commentId]);
            liked = false;
        } else {
            // Like
            await pool.query('INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)', [commentId, userId]);
            await pool.query('UPDATE post_comments SET likes = likes + 1 WHERE id = $1', [commentId]);
            liked = true;
        }

        const updatedComment = await pool.query('SELECT likes FROM post_comments WHERE id = $1', [commentId]);
        res.json({ liked, likes: updatedComment.rows[0].likes });
    } catch (err) {
        console.error('Failed to toggle comment like:', err);
        res.status(500).json({ error: 'Failed to toggle comment like' });
    }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    console.log(`404 - API route not found: ${req.method} ${req.url}`);
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Serve frontend build in production
const frontendBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
