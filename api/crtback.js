"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function ServerRequest(request, response) {
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
    if (request.method !== 'POST' && request.method !== 'GET') {
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
        await new Promise((resolve, reject) => {
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', () => resolve());
            request.on('error', err => reject(err));
        });
        // 🔹 Parse JSON
        const data = JSON.parse(body);
        const { email, password, recaptchaToken } = data;
        console.log("Body recebido:", {
            email,
            password: password ? "[PRESENT]" : "[MISSING]",
            token: recaptchaToken ? "[PRESENT]" : "[MISSING]"
        });
        // 🔹 Validar campos obrigatórios
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos'
            }));
            return;
        }
        // 🔐 Verificar reCAPTCHA no Google
        const verifyAPI = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg', // ⚠ coloque sua secret key real
                //altere depois para esconder
                response: recaptchaToken
            })
        });
        const verifyDataAPI = await verifyAPI.json();
        console.log("Resposta Google:", verifyDataAPI);
        // 🔴 Verifica sucesso
        if (!verifyDataAPI) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'reCAPTCHA inválido'
            }));
            return;
        }
        // 🔴 Validação extra para reCAPTCHA v3 (score)
        console.log("reCAPTCHA válido ✔");
        if (!email || !password) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: "Por favor, preencha email e senha"
            }));
            return;
        }
        // ✅ Sucesso: qualquer email e senha preencheu
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: { email }
        }));
        // ✅ Sucesso
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: "Login realizado com sucesso!",
            data: { email }
        }));
    }
    catch (error) {
        console.error("Erro no backend:", error);
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
exports.default = ServerRequest;
//# sourceMappingURL=crtback.js.map