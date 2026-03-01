import http from "node:http";
import ServerRequest from "./ServerRequest";
import dotenv from "dotenv";

dotenv.config(); // Lê variáveis de ambiente (PORT, etc.)

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    // Permitir CORS em qualquer requisição da API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 🔹 Rota da API: /api/crtback
    if (req.url === "/api/crtback") {

        // OPTIONS → preflight
        if (req.method === "OPTIONS") {
            res.statusCode = 200;
            res.end();
            return;
        }

        // POST → processa
        if (req.method === "POST") {
            ServerRequest(req, res);
            return;
        }

        // Qualquer outro método → 405
        res.statusCode = 405;
        res.end(JSON.stringify({
            success: false,
            error: 'Método não permitido'
        }));
        return;
    }

    // Qualquer outra rota → 404
    res.statusCode = 404;
    res.end("Rota não encontrada");
});

// 🔹 Servidor escuta a porta definida pelo ambiente ou 3000
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
import ServerRequest from "./ServerRequest";