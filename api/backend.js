"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function ServerRequest(request, response) {
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
        const bodyData = await new Promise((resolve, reject) => {
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
        const data = JSON.parse(bodyData);
        console.log('Body recebido:', data);
        const { email, password, recaptchaToken } = data;
        console.log('Email:', email);
        console.log('Password:', password ? '[PRESENT]' : '[MISSING]');
        console.log('Token:', recaptchaToken);
        // Validate required fields
        if (!email || !password || !recaptchaToken) {
            response.statusCode = 400;
            response.end(JSON.stringify({
                success: false,
                error: 'Campos obrigatórios não preenchidos',
                details: {
                    email: !email,
                    password: !password,
                    recaptchaToken: !recaptchaToken
                }
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
                secret: '6LctSXksAAAAALmMFlvRvFJ9o1D2gUqt_lbvOVUg', // Your secret key
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
                details: verifyDataAPI
            }));
            return;
        }
        console.log('reCAPTCHA válido!');
        // Check credentials (example hardcoded check)
        if (email !== "senac@gmail.com" || password !== "senacoficialmnbvcxz321#@!") {
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: "Credenciais inválidas"
            }));
            return;
        }
        //lkm
        // Success response
        response.statusCode = 200;
        response.end(JSON.stringify({
            success: true,
            message: 'Login realizado com sucesso!',
            data: { email }
        }));
    }
    catch (error) {
        console.error('Erro no backend:', error);
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
// This function seems unnecessary for your use case
// async function Handler(req: any, res: any): Promise<string> {
//     return `User ${req.nome} and ${res.email}`;
// }
exports.default = ServerRequest;
// export type { Handler };
//# sourceMappingURL=backend.js.map