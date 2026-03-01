"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = __importDefault(require("node:http"));
const ServerRequest_1 = __importDefault(require("./ServerRequest"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Lê variáveis de ambiente (PORT, etc.)
const PORT = process.env.PORT || 3000;
const server = node_http_1.default.createServer((req, res) => {
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
            (0, ServerRequest_1.default)(req, res);
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
//# sourceMappingURL=server.js.map