import { IncomingMessage, ServerResponse } from "node:http";

// ====================================================
// ARRAY EM MEMÓRIA PARA ARMAZENAR OS USUÁRIOS
// ====================================================
// Mesma interface do backend.ts
interface User {
    email: string;
    password: string; // Em produção, isso deveria ser hash!
    username?: string;
    phone?: string;
    createdAt: Date;
}

// Array global de usuários (compartilhado entre os endpoints)
declare global {
    var users: User[];
}

// Inicializar o array se não existir
if (!global.users) {
    global.users = [];
}

// Interface do corpo esperado (agora com campos de registro)
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

    // Preflight
    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    // Apenas POST (removido GET)
    if (request.method !== 'POST') {
        response.statusCode = 405;
        response.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    try {
        // 🔹 Coletar body
        let body = '';

        await new Promise<void>((resolve, reject) => {
            request.on('data', chunk => {
                body += chunk.toString();
            });

            request.on('end', () => resolve());
            request.on('error', err => reject(err));
        });

        // 🔹 Parse JSON
        const data: RegisterRequest = JSON.parse(body);

        const { email, password, confirm_password, username, phone, recaptchaToken } = data;

        console.log("📝 Body recebido (registro):", {
            email,
            username,
            phone,
            password: password ? "[PRESENT]" : "[MISSING]",
            confirm_password: confirm_password ? "[PRESENT]" : "[MISSING]",
            token: recaptchaToken ? "[PRESENT]" : "[MISSING]"
        });

        // 🔹 Validar campos obrigatórios
        if (!email || !password || !confirm_password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos',
                field: !email ? 'email' : !password ? 'password' : !confirm_password ? 'confirm_password' : 'recaptcha'
            }));
            return;
        }

        // 🔹 Validar se as senhas conferem
        if (password !== confirm_password) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'As senhas não conferem',
                field: 'confirm_password'
            }));
            return;
        }

        // 🔹 Validar se email já está cadastrado
        const usuarioExistente = global.users.find(u => u.email === email);
        if (usuarioExistente) {
            response.statusCode = 409; // Conflict
            response.end(JSON.stringify({
                success: false,
                error: 'Este email já está cadastrado',
                field: 'email'
            }));
            return;
        }

        // 🔐 Verificar reCAPTCHA no Google
        const verifyAPI = await fetch(
            'https://www.google.com/recaptcha/api/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg', // ⚠ coloque sua secret key real
                    response: recaptchaToken
                })
            }
        );

        const verifyDataAPI = await verifyAPI.json();

        console.log("🤖 Resposta Google reCAPTCHA:", verifyDataAPI);

        // 🔴 Verifica sucesso do reCAPTCHA
        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido',
                field: 'recaptcha'
            }));
            return;
        }

        // Verificar score do reCAPTCHA (opcional, mas recomendado)

        console.log("✅ reCAPTCHA válido ✔");

        // ====================================================
        // CRIAR O USUÁRIO E SALVAR NO ARRAY GLOBAL
        // ====================================================
        const novoUsuario: User = {
            email: email,
            password: password, // ⚠️ Idealmente hasheado!
            username: username || '',
            phone: phone || '',
            createdAt: new Date()
        };

        // Adicionar ao array global (mesmo usado no backend.ts)
        global.users.push(novoUsuario);

        console.log(`✅ USUÁRIO CRIADO COM SUCESSO: ${email}`);
        console.log(`📋 Total de usuários cadastrados: ${global.users.length}`);
        console.log('📋 Usuários:', global.users.map(u => u.email));

        // ✅ Sucesso - Retornar resposta positiva
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Conta criada com sucesso!",
            data: { 
                email,
                username
            }
        }));

    } catch (error) {
        console.error("❌ Erro no backend (registro):", error);

        if (error instanceof SyntaxError) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "JSON inválido"
            }));
            return;
        }

        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;
