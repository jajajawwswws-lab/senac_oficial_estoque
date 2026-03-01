import { IncomingMessage, ServerResponse } from "node:http";
import { addUser, userExists, User } from "./users.js"; // Importar funções compartilhadas

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

        // Validar se email já está cadastrado (USANDO FUNÇÃO COMPARTILHADA)
        if (userExists(email)) {
            response.statusCode = 409;
            response.end(JSON.stringify({
                success: false,
                error: 'Este email já está cadastrado',
                field: 'email'
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

        // CRIAR O USUÁRIO E SALVAR NO ARRAY COMPARTILHADO
        const novoUsuario: User = {
            email: email,
            password: password, // ⚠️ Idealmente hasheado!
            username: username || '',
            phone: phone || '',
            createdAt: new Date()
        };

        // USAR FUNÇÃO COMPARTILHADA PARA ADICIONAR
        addUser(novoUsuario);

        console.log(`✅ USUÁRIO CRIADO: ${email}`);
        console.log(`📋 Total: ${global.users.length}`);
        console.log('📋 Usuários:', global.users.map(u => u.email));

        // ✅ Sucesso
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
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: "Erro interno do servidor"
        }));
    }
}

export default ServerRequest;
