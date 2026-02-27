import { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

// Substitua pela sua chave secreta do Supabase

const supabase = createClient(
  'https://vercel_icfg_zw4SbRdBbh4Wc6N5T8IK5Ybk.supabase.co', 
  'sb_secret_dszBNc886sOXcFMo1depGg__w5IwFUu'
);
interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken: string;
}

async function ServerRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  // Headers CORS
  response.setHeader('Content-Type', 'application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (request.method === 'OPTIONS') {
    response.statusCode = 200;
    response.end();
    return;
  }

  // Apenas POST
  if (request.method !== 'POST') {
    response.statusCode = 405;
    response.end(
      JSON.stringify({
        success: false,
        error: 'Método não permitido',
      })
    );
    return;
  }

  try {
    // Coletar body
    let body = '';
    await new Promise<void>((resolve, reject) => {
      request.on('data', (chunk) => {
        body += chunk.toString();
      });

      request.on('end', () => resolve());

      request.on('error', (err) => reject(err));
    });

    // Parse JSON
    const data: LoginRequest = JSON.parse(body);

    const { email, password, recaptchaToken } = data;

    console.log('Body recebido:', {
      email,
      password: password ? '[PRESENT]' : '[MISSING]',
      token: recaptchaToken ? '[PRESENT]' : '[MISSING]',
    });

    // Validar campos obrigatórios
    if (!email || !password || !recaptchaToken) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          success: false,
          error: 'Campos obrigatórios não preenchidos',
        })
      );
      return;
    }

    // Verificar reCAPTCHA no Google
    const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg', // Sua chave secreta reCAPTCHA
        response: recaptchaToken,
      }),
    });

    const verifyDataAPI = await verifyAPI.json();

    console.log('Resposta Google:', verifyDataAPI);

    // Verifica se o reCAPTCHA é válido
    if (!verifyDataAPI) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          success: false,
          error: 'reCAPTCHA inválido',
        })
      );
      return;
    }

    // Verificar as credenciais no Supabase (Usando o Supabase Auth)
    const { data: user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      response.statusCode = 401;
      response.end(
        JSON.stringify({
          success: false,
          error: 'Credenciais inválidas',
        })
      );
      return;
    }

    console.log('Usuário logado:', user);

    // Retornar sucesso
    response.statusCode = 200;
    response.end(
      JSON.stringify({
        success: true,
        message: 'Login realizado com sucesso!',
        data: { email },
      })
    );
  } catch (error) {
    console.error('Erro no backend:', error);

    if (error instanceof SyntaxError) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          success: false,
          error: 'JSON inválido',
        })
      );
      return;
    }

    response.statusCode = 500;
    response.end(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
      })
    );
  }
}
export default ServerRequest;
