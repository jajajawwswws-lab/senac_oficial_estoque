
const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const cors = require('cors'); // 🔴 ADICIONE ISSO!

const app = express();

// 🔴 CONFIGURAÇÃO CORS - ESSENCIAL!

app.use(cors({
    origin: 'https://senac-system.vercel.app', // 🔴 A ORIGEM DO SEU FRONTEND NA VERCEL
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'seu-secret-aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.post('/login', async (req, res) => {
    try {
        if (!req.body['g-recaptcha-response']) {
            return res.json({
                sucesso: false,
                erro: 'Token reCAPTCHA não recebido'
            });
        }

        const recaptcha_secret = "6LcvXCEsAAAAALhdjN9brcMVR33i5aQwspMOWXv9";
        const recaptcha_response = req.body['g-recaptcha-response'];

        const recaptchaResponse = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${recaptcha_secret}&response=${recaptcha_response}`,
            { method: 'POST' }
        );
        
        const recaptcha_data = await recaptchaResponse.json();

        if (!recaptcha_data.success || recaptcha_data.score < 0.5) {
            return res.json({
                sucesso: false,
                erro: 'Falha na verificação do reCAPTCHA'
            });
        }

        const email = req.body.email || '';
        const senha = req.body.password || '';

        const login_valido = (email === "teste@email.com" && senha === "123456");

        if (login_valido) {
            req.session.usuario = email;
            return res.json({
                sucesso: true,
                login_valido: true,
                score: recaptcha_data.score
            });
        } else {
            return res.json({
                sucesso: true,
                login_valido: false,
                erro: 'Credenciais inválidas'
            });
        }
    } catch (error) {
        return res.json({
            sucesso: false,
            erro: 'Erro interno do servidor'
        });
    }
});

// 🔴 PORTA CONFIGURÁVEL
const PORT = process.env.PORT || 3000; // Mude o 3000 para qualquer número

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 URL: https://localhost:${PORT}/login`);
});
