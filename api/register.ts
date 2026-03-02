import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env['CORS_ORIGIN'] || '*' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Server-side Supabase admin client (SERVICE ROLE) - must NOT be exposed to clients
const SUPABASE_URL = process.env['SUPABASE_URL'] || 'https://fbbkshvhbfgdopsgtlxi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYmtzaHZoYmZnZG9wc2d0bHhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MzYyOSwiZXhwIjoyMDg3NDQ5NjI5fQ.3a6zBgyKhPyUUIJLuaA8W3qEcv-_JfQsgDF_M9AAnQY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Helper: basic validation
function validatePayload(body: any) {
  const { email, password } = body || {};
  if (!email || typeof email !== 'string') return 'email is required';
  if (!password || typeof password !== 'string') return 'password is required';
  // optional: add email regex, password strength, username checks, phone format, etc.
  return null;
}

app.post('/api/register', async (req, res) => {
  try {
    const errMsg = validatePayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { email, password, username = null, phone = null, metadata = {} } = req.body;

    // 1) Check existing user in "users" table (by email)
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error checking existing user:', fetchErr);
      return res.status(500).json({ error: 'Erro ao verificar usuário existente' });
    }
    if (existing) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // 2) Create Auth user via Admin (service_role)
    // Using admin API: create user and set email_confirm = true optionally
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { ...metadata, username, phone },
      email_confirm: true, // set to true to bypass confirmation email; set false if you want confirmation flow
    });

    if (authError) {
      console.error('Supabase admin.createUser error:', authError);
      // If auth failed due to duplicate, map to 409
      return res.status(400).json({ error: authError.message || 'Erro criando usuário no Auth' });
    }

    const authUserId = authData?.user?.id;

    // 3) Insert into "users" profile table (associate with auth user id if desired)
    const insertPayload: any = {
      email,
      username,
      phone,
      created_at: new Date().toISOString(),
    };
    if (authUserId) insertPayload.auth_user_id = authUserId; // optional column

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('users')
      .insert([insertPayload])
      .select()
      .single();

    if (insertErr) {
      console.error('Error inserting user profile:', insertErr);
      // Attempt to roll back auth user if profile insert totally failed
      try {
        if (authUserId) {
          await supabaseAdmin.auth.admin.deleteUser(authUserId);
        }
      } catch (rollbackErr) {
        console.error('Failed to rollback auth user after profile insert failure:', rollbackErr);
      }
      return res.status(500).json({ error: 'Erro ao criar perfil do usuário' });
    }

    // Success
    return res.status(201).json({
      message: 'Usuário criado com sucesso',
      auth_user: { id: authUserId, email: authData?.user?.email },
      profile: inserted,
    });
  } catch (err) {
    console.error('Unexpected error in /api/register:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// health
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});