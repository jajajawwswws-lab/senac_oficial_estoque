// api/register.ts - VERSÃO CORRETA
import express, { Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

interface RecaptchaVerify {
  success?: boolean;
  score?: number;
  'error-codes'?: string[];
}

dotenv.config();

const SUPABASE_URL = process.env['https://fbbkshvhbfgdopsgtlxi.supabase.co'];
const SUPABASE_SERVICE_ROLE_KEY = process.env['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYmtzaHZoYmZnZG9wc2d0bHhpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg3MzYyOSwiZXhwIjoyMDg3NDQ5NjI5fQ.3a6zBgyKhPyUUIJLuaA8W3qEcv-_JfQsgDF_M9AAnQY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(express.json());

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

    const recaptchaOk = await verifyRecaptcha(recaptchaToken ?? null);
    if (!recaptchaOk) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }

    // Verificar email no Auth (NÃO na tabela)
    let emailExists = false;
    let page = 1;
    const pageSize = 1000;
    
    try {
      while (!emailExists) {
        const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
          page: page,
          perPage: pageSize
        });

        if (listErr) {
          console.warn('Could not list users:', listErr);
          break;
        }

        if (usersData?.users) {
          const exists = usersData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
          if (exists) {
            emailExists = true;
            break;
          }
          
          if (usersData.users.length < pageSize) break;
          page++;
        } else {
          break;
        }
      }
    } catch (err) {
      console.warn('Error checking email:', err);
    }

    if (emailExists) {
      return res.status(409).json({ success: false, error: 'Email already in use' });
    }

    // Verificar username na tabela
    const { data: existingUsername, error: usernameError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) {
      console.error('Username check error:', usernameError);
    } else if (existingUsername) {
      return res.status(409).json({ success: false, error: 'Username already taken' });
    }

    // Criar usuário no Auth
    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { username, phone },
    });

    if (createError || !createdUser) {
      console.error('auth.createUser error', createError);
      return res.status(400).json({ success: false, error: createError?.message || 'Failed to create user' });
    }

    const userId = createdUser.user?.id;
    
    if (!userId) {
      console.error('No user ID returned', createdUser);
      return res.status(500).json({ success: false, error: 'Failed to create user' });
    }

    // Inserir na tabela users com o ID do Auth como PK
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([{ id: userId, username, phone }]);

    if (insertError) {
      console.error('insert profile error', insertError);
      
      // Rollback
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (delErr) {
        console.error('failed to delete orphan auth user', delErr);
      }
      
      const message = insertError?.message?.toLowerCase() ?? '';
      if (message.includes('duplicate') || message.includes('unique')) {
        return res.status(409).json({ success: false, error: 'Conflict: username or id already exists' });
      }
      return res.status(500).json({ success: false, error: 'Failed to create user profile' });
    }

    return res.status(201).json({ success: true, userId });
  } catch (err: any) {
    console.error('unexpected error', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }));

const port = process.env['PORT'] ? Number(process.env['PORT']) : 3000;
app.listen(port, () => {
  console.log(`api/register running on :${port}`);
});

export default app;
