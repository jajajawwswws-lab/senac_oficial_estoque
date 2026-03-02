// api/vercel/register.ts
// Vercel Serverless function handler equivalent of api/register.ts
// Place this file under /api in your repo root for Vercel (or configure accordingly).
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface RecaptchaVerify {
  success?: boolean;
  score?: number;
  'error-codes'?: string[];
}

const SUPABASE_URL = process.env['SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  // Do not throw during import; Vercel will surface logs on invocation.
}

const supabaseAdmin: SupabaseClient | null = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

async function verifyRecaptcha(token: string | null): Promise<boolean> {
  const secret = process.env['RECAPTCHA_SECRET'];
  if (!secret) return true;
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);

    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const json = (await r.json()) as RecaptchaVerify;
    return !!json.success && (json.score === undefined || json.score >= 0.5);
  } catch (err) {
    console.error('recaptcha verify error', err);
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST,GET');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

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

    const recaptchaOk = await verifyRecaptcha(recaptchaToken ?? null);
    if (!recaptchaOk) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }

    // Username uniqueness check
    try {
      const { data: existing, error: usernameQueryError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .limit(1);
      if (usernameQueryError) {
        console.warn('username uniqueness check warning:', usernameQueryError);
      } else if (Array.isArray(existing) && existing.length > 0) {
        return res.status(409).json({ success: false, error: 'Username already taken' });
      }
    } catch (err) {
      console.warn('username uniqueness check failed (non-fatal):', err);
    }

    const createResp = await (supabaseAdmin.auth as any).admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username, phone },
    });

    const createError = createResp?.error ?? null;
    const createdCandidate = createResp?.data?.user ?? createResp?.data ?? createResp?.user ?? createResp;
    if (createError) {
      console.error('auth.createUser error (masked):', createError);
      const msg = String(createError?.message ?? createError).toLowerCase();
      if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) {
        return res.status(409).json({ success: false, error: 'Email already in use' });
      }
      return res.status(400).json({ success: false, error: 'Failed to create user' });
    }

    const userId = createdCandidate?.id ?? createdCandidate?.user_id ?? createdCandidate?.uid ?? null;
    if (!userId) {
      console.error('auth.createUser returned no id (masked)', createdCandidate);
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ id: userId, username, phone }]);

    if (insertError) {
      console.error('insert profile error (masked):', insertError);
      try {
        await (supabaseAdmin.auth as any).admin.deleteUser(userId);
      } catch (delErr) {
        console.error('failed to delete orphan auth user (masked):', delErr);
      }
      const message = String(insertError?.message ?? '').toLowerCase();
      if (message.includes('duplicate') || message.includes('unique')) {
        return res.status(409).json({ success: false, error: 'Conflict: username or id already exists' });
      }
      return res.status(500).json({ success: false, error: 'Failed to create user profile' });
    }

    return res.status(201).json({ success: true, userId });
  } catch (err: any) {
    console.error('unexpected error in vercel handler (masked):', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}