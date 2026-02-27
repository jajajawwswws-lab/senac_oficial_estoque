import { IncomingMessage, ServerResponse } from "node:http";

interface Item {
    id: number;
    nome: string;
    categoria: string;
    localizacao: string;
    responsavel: string;
    status: 'em_uso' | 'defeito' | 'manutencao';
    dataCadastro: string;
}

interface Defeito {
    id: number;
    item: string;
    defeito: string;
    data: string;
    hora: string;
}

interface Comentario {
    id: number;
    item: string;
    comentario: string;
    data: string;
    hora: string;
}

// Array global (simulando banco de dados)
declare global {
    var itens: Item[];
    var defeitos: Defeito[];
    var comentarios: Comentario[];
}

if (!global.itens) {
    global.itens = [
        {
            id: 1,
            nome: "Monitor Dell 24\"",
            categoria: "Eletrônicos",
            localizacao: "Sala 201",
            responsavel: "bot1",
            status: "em_uso",
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        },
        {
            id: 2,
            nome: "Notebook Dell XPS",
            categoria: "Eletrônicos",
            localizacao: "Sala 302",
            responsavel: "bot2",
            status: "em_uso",
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        }
    ];
}

if (!global.defeitos) {
    global.defeitos = [];
}

if (!global.comentarios) {
    global.comentarios = [];
}

export default async function ServerRequest(
    request: IncomingMessage,
    response: ServerResponse
) {
    // CORS headers
    response.setHeader('Content-Type', 'application/json');
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.statusCode = 200;
        response.end();
        return;
    }

    const url = request.url || '';
    const method = request.method || '';

    try {
        // ==================== GET ====================
        if (method === 'GET') {
            if (url === '/api/itens') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.itens
                }));
                return;
            }
            
            if (url === '/api/defeitos') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.defeitos
                }));
                return;
            }
            
            if (url === '/api/comentarios') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.comentarios
                }));
                return;
            }
            
            if (url === '/api/estatisticas') {
                const emUso = global.itens.filter(i => i.status === 'em_uso').length;
                const comDefeito = global.itens.filter(i => i.status === 'defeito').length;
                const emManutencao = global.itens.filter(i => i.status === 'manutencao').length;
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: {
                        emUso,
                        comDefeito,
                        emManutencao,
                        total: global.itens.length
                    }
                }));
                return;
            }
        }

        // ==================== POST ====================
        if (method === 'POST') {
            let body = '';
            await new Promise((resolve) => {
                request.on('data', chunk => body += chunk.toString());
                request.on('end', resolve);
            });

            const data = JSON.parse(body);

            if (url === '/api/itens') {
                const novoItem: Item = {
                    id: Date.now(),
                    nome: data.nome,
                    categoria: data.categoria,
                    localizacao: data.localizacao,
                    responsavel: data.responsavel,
                    status: data.status || 'em_uso',
                    dataCadastro: new Date().toLocaleDateString('pt-BR')
                };
                
                global.itens.push(novoItem);
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item adicionado com sucesso',
                    data: novoItem
                }));
                return;
            }

            if (url === '/api/defeitos') {
                const novoDefeito: Defeito = {
                    id: Date.now(),
                    item: data.item,
                    defeito: data.defeito,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                };
                
                global.defeitos.push(novoDefeito);
                
                // Atualizar status do item
                const item = global.itens.find(i => i.nome === data.item);
                if (item) {
                    item.status = 'defeito';
                }
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito registrado',
                    data: novoDefeito
                }));
                return;
            }

            if (url === '/api/comentarios') {
                const novoComentario: Comentario = {
                    id: Date.now(),
                    item: data.item,
                    comentario: data.comentario,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                };
                
                global.comentarios.push(novoComentario);
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Comentário adicionado',
                    data: novoComentario
                }));
                return;
            }
        }

        // ==================== PUT ====================
        if (method === 'PUT') {
            let body = '';
            await new Promise((resolve) => {
                request.on('data', chunk => body += chunk.toString());
                request.on('end', resolve);
            });

            const data = JSON.parse(body);

            if (url.startsWith('/api/itens/')) {
                const id = parseInt(url.split('/').pop() || '0');
                const itemIndex = global.itens.findIndex(i => i.id === id);
                
                if (itemIndex === -1) {
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Item não encontrado'
                    }));
                    return;
                }
                
                global.itens[itemIndex] = {
                    ...global.itens[itemIndex],
                    ...data,
                    id: global.itens[itemIndex].id
                };
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item atualizado',
                    data: global.itens[itemIndex]
                }));
                return;
            }
        }

        // ==================== DELETE ====================
        if (method === 'DELETE') {
            if (url.startsWith('/api/itens/')) {
                const id = parseInt(url.split('/').pop() || '0');
                global.itens = global.itens.filter(i => i.id !== id);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item removido'
                }));
                return;
            }

            if (url.startsWith('/api/defeitos/')) {
                const id = parseInt(url.split('/').pop() || '0');
                global.defeitos = global.defeitos.filter(d => d.id !== id);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito removido'
                }));
                return;
            }
        }

        // Rota não encontrada
        response.statusCode = 404;
        response.end(JSON.stringify({
            success: false,
            error: 'Rota não encontrada'
        }));

    } catch (error) {
        console.error('❌ Erro:', error);
        response.statusCode = 500;
        response.end(JSON.stringify({
            success: false,
            error: 'Erro interno do servidor'
        }));
    }
}
