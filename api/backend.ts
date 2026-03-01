import { IncomingMessage, ServerResponse } from "node:http";
import { findUserByEmail, getAllUsers } from "./users.js"; // Importar funções compartilhadas
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from "./lib/supabaseClient.js";
import { supabaseAdmin } from "./banco.js";



export default async function handler(
  request: VercelRequest,
  response: VercelResponse
){


  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') {
    return response.status(200).end()
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { email, password, action } = request.body

    if (action === 'signup') {
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password
      })

      if (error) throw error
      return response.status(201).json(data)
    }

    if (action === 'signin') {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return response.status(200).json(data)
    }

    return response.status(400).json({ error: 'Ação inválida' })
  } catch (error) {
    console.error('Erro:', error)
    return response.status(500).json({ error: 'Erro interno do servidor' })
  }








}


// Interface do corpo esperado para login
interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
}

async function ServerRequest(
    request: IncomingMessage,
    response: ServerResponse
): Promise<void> {

    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        let body = '';
        await new Promise<void>((resolve, reject) => {
            request.on('data', chunk => body += chunk.toString());
            request.on('end', () => resolve());
            request.on('error', err => reject(err));
        });

        const data: LoginRequest = JSON.parse(body);
        const { email, password, recaptchaToken } = data;

        console.log("📝 Body recebido (login):", { email });

        // Validar campos obrigatórios
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos'
            }));
            return;
        }

        // Verificar reCAPTCHA
        const verifyAPI = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg',
                    response: recaptchaToken
                })
            }
        );

        const verifyDataAPI = await verifyAPI.json();
        console.log("🤖 Resposta Google reCAPTCHA:", verifyDataAPI);

        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
                field: 'recaptcha'
            }));
            return;
        }

        // BUSCAR USUÁRIO NO ARRAY COMPARTILHADO
        console.log("🔍 Buscando usuário:", email);
        console.log("📋 Todos usuários:", getAllUsers().map(u => u.email));
        
        const usuario = findUserByEmail(email);

        if (!usuario) {
            console.log("❌ Usuário não encontrado:", email);
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: 'E-mail não encontrado',
                field: 'email'
            }));
            return;
        }

        // Verificar senha
        if (usuario.password !== password) {
            console.log("❌ Senha incorreta para:", email);
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: 'Senha incorreta',
                field: 'password'
            }));
            return;
        }

        console.log("✅ Login bem-sucedido:", email);

        // Login bem-sucedido
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: {
                email: usuario.email,
                username: usuario.username
            }
        }));

    } catch (error) {
        console.error("❌ Erro no backend (login):", error);
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;