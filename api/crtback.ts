import { IncomingMessage, ServerResponse } from "node:http";
import { createClient } from "@supabase/supabase-js";

//import { User } from "./users.js";  // 👈 IMPORTANTE: Importar a interface User

// Configuração do Supabase
const supabaseUrl = process.env["SUPABASE_ANON_KEY"]!;
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Interface do corpo esperado
interface RegisterRequest {
    email: string;
    password: string;
    confirm_password: string;
    username: string;
    phone: string;
    recaptchaToken: string;
}

async function ServerRequest(
    request: IncomingMessage,
    response: ServerResponse
): Promise<void> {

    // Headers CORS
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
        // Coletar body
        let body = '';
        await new Promise<void>((resolve, reject) => {
            request.on('data', chunk => body += chunk.toString());
            request.on('end', () => resolve());
            request.on('error', err => reject(err));
        });

        const data: RegisterRequest = JSON.parse(body);
        const { email, password, confirm_password, username, phone, recaptchaToken } = data;

        console.log("📝 Body recebido (registro):", { email, username, phone });

        // Validar campos obrigatórios
        if (!email || !password || !confirm_password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos'
            }));
            return;
        }

        // Validar se as senhas conferem
        if (password !== confirm_password) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'As senhas não conferem',
                field: 'confirm_password'
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
                    secret: process.env["RECAPTCHA_SECRET_KEY"] || '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg',
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

        // 1. PRIMEIRO: Verificar se email já existe no Supabase
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            response.statusCode = 409;
            response.end(JSON.stringify({
                success: false,
                error: 'Este email já está cadastrado',
                field: 'email'
            }));
            return;
        }

        // 2. CRIAR USUÁRIO no Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    phone
                }
            }
        });

        if (authError) {
            console.error("❌ Erro no Auth:", authError);
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: authError.message
            }));
            return;
        }

        // 3. SALVAR DADOS ADICIONAIS na tabela 'users'
        //importante para log
        if (authData.user) {
            const { error: insertError } = await supabaseAdmin
                .from('users')
                .insert([
                    {
                        id: authData.user.id,
                        email: email,
                        username: username || email.split('@')[0],
                        phone: phone || null,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (insertError) {
                console.error("❌ Erro ao salvar dados adicionais:", insertError);
                // Não falha a requisição, apenas loga o erro
            }
        }

        console.log(`✅ USUÁRIO CRIADO NO SUPABASE: ${email}`);

        // ✅ Sucesso
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Conta criada com sucesso! Verifique seu email.",
            data: { 
                email,
                username,
                id: authData.user?.id
            }
        }));

    } catch (error) {
        console.error("❌ Erro no backend (registro):", error);
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;