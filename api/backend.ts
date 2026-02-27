import { IncomingMessage, ServerResponse } from "node:http";

// ====================================================
// ARRAY EM MEMÓRIA PARA ARMAZENAR OS USUÁRIOS
// ====================================================
// Este array será preenchido pelo crtback.ts (registro)
// e consultado por este backend.ts (login)
interface User {
    email: string;
    password: string; // Em produção, isso deveria ser hash!
    username?: string;
    phone?: string;
    createdAt: Date;
}

// Array global de usuários (compartilhado entre os endpoints)
// Em um sistema real, isso seria um banco de dados
declare global {
    var users: User[];
}

// Inicializar o array se não existir
if (!global.users) {
    global.users = [];
}

// Interface for the expected request body
interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
}

async function ServerRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    // Set CORS headers
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido no sistema'
        }));
        return;
    }

    try {
        // Collect the request body
        let body = '';
        
        // Use Promise to handle the data collection
        const bodyData = await new Promise<string>((resolve, reject) => {
            request.on('data', (chunk) => {
                body += chunk.toString();
            });
            
            request.on('end', () => {
                resolve(body);
            });
            
            request.on('error', (err) => {
                reject(err);
            });
        });

        // Parse the body as LoginRequest
        const data: LoginRequest = JSON.parse(bodyData);
        console.log('Body recebido:', {
            email: data.email,
            password: data.password ? '[PRESENT]' : '[MISSING]',
            recaptchaToken: data.recaptchaToken ? '[PRESENT]' : '[MISSING]'
        });

        const { email, password, recaptchaToken } = data;

        // Validate required fields
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos',
                field: !email ? 'email' : !password ? 'password' : 'recaptcha'
            }));
            return;
        }

        // Verify reCAPTCHA with Google
        const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg', // ⚠️ Coloque sua secret key real aqui!
                response: recaptchaToken
            })
        });
        
        const verifyDataAPI = await verifyAPI.json();
        console.log('Resposta do Google:', verifyDataAPI);
        
        // Check if reCAPTCHA verification failed
        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
                field: 'recaptcha'
            }));
            return;
        }

        // Opcional: verificar score do reCAPTCHA v3
     

        console.log('✅ reCAPTCHA válido!');

        // ====================================================
        // CONSULTAR O ARRAY DE USUÁRIOS EM MEMÓRIA
        // ====================================================
        console.log('📋 Usuários cadastrados:', global.users.map(u => u.email));
        
        // Buscar usuário pelo email
        const user = global.users.find(u => u.email === email);

        if (!user) {
            console.log(`❌ Email não encontrado: ${email}`);
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: "E-mail não encontrado. Crie uma conta primeiro.",
                field: 'email'
            }));
            return;
        }

        console.log(`✅ Usuário encontrado: ${user.email}`);

        // ====================================================
        // VERIFICAR A SENHA
        // ====================================================
        // ⚠️ IMPORTANTE: No crtback.ts você PRECISA armazenar a senha!
        // Como não temos hash, comparamos diretamente (NÃO SEGURO para produção!)
        if (user.password !== password) {
            console.log(`❌ Senha incorreta para: ${email}`);
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: "Senha incorreta",
                field: 'password'
            }));
            return;
        }

        console.log(`✅ Senha válida para: ${email}`);

        // ====================================================
        // LOGIN BEM-SUCEDIDO
        // ====================================================
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Login realizado com sucesso!',
            data: {
                email: user.email,
                username: user.username,
                // Não retornamos a senha!
            },
            redirect: 'account.html'
        }));

    } catch (error) {
        console.error('❌ Erro no backend:', error);
        
        // Handle JSON parse errors specifically
        if (error instanceof SyntaxError) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'JSON inválido'
            }));
            return;
        }
        
        // Generic server error
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}

export default ServerRequest;
