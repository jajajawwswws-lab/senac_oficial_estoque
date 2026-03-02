import express, { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

dotenv.config();

/**
 * Environment vars
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - PORT (optional)
 * - ALLOWED_ORIGINS (comma separated) - optional, defaults to http://localhost:3000
 * - RECAPTCHA_SECRET (optional) - if set, reCAPTCHA will be validated
 */

const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const ALLOWED_ORIGINS = (process.env['ALLOWED_ORIGINS'] || 'http://localhost:3000').split(',').map(s => s.trim());
const RECAPTCHA_SECRET = process.env['RECAPTCHA_SECRET'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(express.json());

// CORS setup
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, server-to-server)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Rate limiter (configurable via env if desired)
const limiter = rateLimit({
  windowMs: Number(process.env['RATE_WINDOW_MS'] || 60_000), // 1 minute
  max: Number(process.env['RATE_MAX'] || 10), // limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/register', limiter);

// Simple logger middleware
app.use((req, _res, next) => {
  console.info(JSON.stringify({
    t: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip
  }));
  next();
});

type RecaptchaResponse = {
  success?: boolean;
  score?: number;
  'error-codes'?: string[];
};

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  if (!RECAPTCHA_SECRET) {
    // Optional behavior: skip if not configured
    return true;
  }
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', RECAPTCHA_SECRET);
    params.append('response', token);

    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const json = (await r.json()) as RecaptchaResponse;
    return !!json.success && (json.score === undefined || json.score >= 0.5);
  } catch (err) {
    console.error('recaptcha verify error', err);
    return false;
  }
}

async function adminGetUserByEmail(email: string) {
  // Try admin.getUserByEmail if available in SDK; fallback to listUsers pagination.
  try {
    // @ts-ignore
    const adminAuth: any = supabaseAdmin.auth.admin;
    if (adminAuth && typeof adminAuth.getUserByEmail === 'function') {
      const resp = await adminAuth.getUserByEmail(email);
      return { found: !!resp?.data?.user, user: resp?.data?.user, error: resp?.error ?? null };
    }
  } catch (err) {
    console.warn('admin.getUserByEmail threw, falling back to pagination:', err);
  }

  try {
    const adminAuth: any = (supabaseAdmin.auth.admin as any);
    const perPage = 1000;
    let page = 1;
    while (true) {
      const { data: listResp, error } = await adminAuth.listUsers({ page, perPage });
      if (error) return { found: false, user: null, error };
      const users = listResp?.users ?? [];
      const match = users.find((u: any) => String(u.email).toLowerCase() === String(email).toLowerCase());
      if (match) return { found: true, user: match, error: null };
      if (users.length < perPage) break;
      page++;
    }
    return { found: false, user: null, error: null };
  } catch (err) {
    return { found: false, user: null, error: err };
  }
}

function validateUsername(username: string): boolean {
  // allow letters, numbers, underscores, dots; 3-30 chars; cannot start/end with dot/underscore; no consecutive dots/underscores
  const re = /^(?!.*[._]{2})(?![._])(?!.*[._]$)[a-zA-Z0-9._]{3,30}$/;
  return re.test(username);
}

function validatePhone(phone?: string): boolean {
  if (!phone) return true;
  // basic minimal check: digits + optional + - spaces, 7-20 chars
  return /^[\d+\-\s()]{7,20}$/.test(phone);
}

app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username, phone, recaptchaToken } = req.body ?? {};

    if (!email || !password || !username) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    if (typeof email !== 'string' || typeof password !== 'string' || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid input types' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    }
    if (!validateUsername(username)) {
      return res.status(400).json({ success: false, error: 'Invalid username format' });
    }
    if (!validatePhone(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone format' });
    }

    const recaptchaOk = await verifyRecaptcha(recaptchaToken ?? null);
    if (!recaptchaOk) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }

    // Check if email exists in Auth
    let emailExists = false;
    try {
      const { found, error } = await adminGetUserByEmail(email);
      if (error) {
        console.warn('Warning: error checking existing email', error);
      } else if (found) {
        emailExists = true;
      }
    } catch (err) {
      console.warn('Error during email existence check', err);
    }

    if (emailExists) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    // Check username uniqueness in DB
    try {
      const { data: existing, error: qErr } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1);

      if (qErr) {
        console.error('username uniqueness check error', qErr);
      } else if (existing && Array.isArray(existing) && existing.length > 0) {
        return res.status(409).json({ success: false, error: 'Username already taken' });
      }
    } catch (err) {
      console.warn('username check unexpected error', err);
    }

    // Create Auth user
    // @ts-ignore
    const adminAuth: any = supabaseAdmin.auth.admin;
    const createResp = await adminAuth.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username, phone },
    });

    const createError = createResp?.error ?? null;
    const createdUserResp = createResp?.data ?? createResp; // depending on sdk shape

    if (createError || !createdUserResp) {
      console.error('auth.createUser error', createError ?? createdUserResp);
      const errMsg = createError?.message ?? 'Failed to create user';
      return res.status(400).json({ success: false, error: errMsg });
    }

    const userId = createdUserResp.user?.id ?? createdUserResp?.id;
    if (!userId) {
      console.error('auth.createUser returned no id', createdUserResp);
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    // Insert profile row
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ id: userId, username, phone }]);

    if (insertError) {
      console.error('insert profile error', { message: insertError.message });
      // rollback auth user creation
      try {
        await adminAuth.deleteUser(userId);
      } catch (delErr) {
        console.error('failed to delete orphan auth user', delErr);
      }
      const message = String(insertError.message ?? '').toLowerCase();
      if (message.includes('duplicate') || message.includes('unique')) {
        return res.status(409).json({ success: false, error: 'Conflict: username or id already exists' });
      }
      return res.status(500).json({ success: false, error: 'Failed to create user profile' });
    }

    return res.status(201).json({ success: true, userId });
  } catch (err) {
    console.error('unexpected error in /api/register', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// health
app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

// basic express error handler for CORS and others
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('handled error', err?.message ?? err);
  res.status(400).json({ success: false, error: err?.message ?? 'Bad Request' });
});

// start if run directly
if (require.main === module) {
  const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
  app.listen(port, () => {
    console.log(`api/register running on :${port}`);
  });
}

export default app;