// api/backend.js
export default async function handler(req, res) {
    // ✅ IMPORTANTE: Configurar CORS e headers
    res.setHeader('Content-Type', 'application/json');
    
    // Permitir requisições de qualquer origem (para teste)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Responder preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // ✅ VERIFICAR METHOD
        if (req.method !== 'POST') {
            return res.status(405).json({ 
                sucesso: false, 
                erro: 'Método não permitido' 
            });
        }

        // ✅ LOG PARA DEBUG
        console.log('Body recebido:', req.body);

        const { nome, email, recaptchaToken } = req.body;

        // ✅ VALIDAR CAMPOS
        if (!nome || !email || !recaptchaToken) {
            return res.status(400).json({
                sucesso: false,
                erro: 'Campos obrigatórios faltando',
                detalhes: {
                    nome: !nome,
                    email: !email,
                    recaptchaToken: !recaptchaToken
                }
            });
        }

        // Verificar reCAPTCHA
        const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: '6LeJZ28sAAAAAO3iQx4CXaN7xAvZNw2fnaacmCYE',
                response: recaptchaToken
            })
        });

        const verifyData = await verifyRes.json();
        console.log('Resposta do Google:', verifyData);

        if (!verifyData.success) {
            return res.status(400).json({
                sucesso: false,
                erro: 'reCAPTCHA inválido',
                detalhes: verifyData['error-codes']
            });
        }

        // Sucesso!
        return res.status(200).json({
            sucesso: true,
            mensagem: 'Formulário enviado com sucesso!',
            dados: { nome, email }
        });

    } catch (erro) {
        console.error('Erro no backend:', erro);
        return res.status(500).json({
            sucesso: false,
            erro: 'Erro interno',
            detalhes: erro.message
        });
    }
}
