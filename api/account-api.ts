import { IncomingMessage, ServerResponse } from "node:http";

interface Item {
    id: number;
    nome: string;
    categoria: string;
    localizacao: string;
    responsavel: string;
    status: 'em_uso' | 'defeito' | 'manutencao';
    dataCadastro: string;
    dataHora?: string; // Adicionar para registrar momento exato
}

interface Defeito {
    id: number;
    item: string;
    itemId?: number; // Adicionar para referência ao ID do item
    defeito: string;
    data: string;
    hora: string;
}

interface Comentario {
    id: number;
    item: string;
    itemId?: number; // Adicionar para referência ao ID do item
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
    const agora = new Date();
    global.itens = [
        {
            id: 1,
            nome: "Monitor Dell 24\"",
            categoria: "Eletrônicos",
            localizacao: "Sala 201",
            responsavel: "bot1",
            status: "em_uso",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR')
        },
        {
            id: 2,
            nome: "Notebook Dell XPS",
            categoria: "Eletrônicos",
            localizacao: "Sala 302",
            responsavel: "bot2",
            status: "em_uso",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR')
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

    console.log(`📡 ${method} ${url}`);

    try {
        // ==================== GET ====================
        if (method === 'GET') {
            // Listar todos os itens
            if (url === '/api/itens' || url === '/api/account-api') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.itens
                }));
                return;
            }
            
            // Buscar item por ID
            if (url.startsWith('/api/itens/')) {
                const id = parseInt(url.split('/').pop() || '0');
                const item = global.itens.find(i => i.id === id);
                
                if (!item) {
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Item não encontrado'
                    }));
                    return;
                }
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: item
                }));
                return;
            }
            
            // Listar defeitos
            if (url === '/api/defeitos') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.defeitos
                }));
                return;
            }
            
            // Listar comentários
            if (url === '/api/comentarios') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.comentarios
                }));
                return;
            }
            
            // Estatísticas
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

            // Adicionar novo item
            if (url === '/api/itens' || url === '/api/account-api') {
                // Gerar novo ID
                const novoId = global.itens.length > 0 
                    ? Math.max(...global.itens.map(i => i.id)) + 1 
                    : 1;
                
                const agora = new Date();
                const novoItem: Item = {
                    id: novoId,
                    nome: data.nome,
                    categoria: data.categoria,
                    localizacao: data.localizacao,
                    responsavel: data.responsavel,
                    status: data.status || 'em_uso',
                    dataCadastro: agora.toLocaleDateString('pt-BR'),
                    dataHora: agora.toLocaleString('pt-BR')
                };
                
                global.itens.push(novoItem);
                
                console.log(`✅ Item adicionado: ${novoItem.nome} (ID: ${novoItem.id})`);
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item adicionado com sucesso',
                    data: novoItem
                }));
                return;
            }

            // Registrar defeito
            if (url === '/api/defeitos') {
                const agora = new Date();
                const novoDefeito: Defeito = {
                    id: Date.now(),
                    item: data.item,
                    itemId: data.itemId,
                    defeito: data.defeito,
                    data: agora.toLocaleDateString('pt-BR'),
                    hora: agora.toLocaleTimeString('pt-BR')
                };
                
                global.defeitos.push(novoDefeito);
                
                // Atualizar status do item
                const item = global.itens.find(i => i.id === data.itemId || i.nome === data.item);
                if (item) {
                    item.status = 'defeito';
                    console.log(`🔧 Item marcado como defeito: ${item.nome}`);
                }
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito registrado',
                    data: novoDefeito
                }));
                return;
            }

            // Adicionar comentário
            if (url === '/api/comentarios') {
                const agora = new Date();
                const novoComentario: Comentario = {
                    id: Date.now(),
                    item: data.item,
                    itemId: data.itemId,
                    comentario: data.comentario,
                    data: agora.toLocaleDateString('pt-BR'),
                    hora: agora.toLocaleTimeString('pt-BR')
                };
                
                global.comentarios.push(novoComentario);
                
                console.log(`💬 Comentário adicionado para: ${data.item}`);
                
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

            // Atualizar item por ID
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
                
                // Atualizar apenas os campos fornecidos
                global.itens[itemIndex] = {
                    ...global.itens[itemIndex],
                    ...data,
                    id: global.itens[itemIndex].id // Manter o ID original
                };
                
                console.log(`📝 Item atualizado: ${global.itens[itemIndex].nome}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item atualizado',
                    data: global.itens[itemIndex]
                }));
                return;
            }

            // Atualizar status do item (para manutenção)
            if (url === '/api/itens/status') {
                const item = global.itens.find(i => i.id === data.id || i.nome === data.nome);
                
                if (!item) {
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Item não encontrado'
                    }));
                    return;
                }
                
                item.status = data.status;
                
                console.log(`🔄 Status do item ${item.nome} alterado para: ${data.status}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Status atualizado',
                    data: item
                }));
                return;
            }
        }

        // ==================== DELETE ====================
        if (method === 'DELETE') {
            // Remover item por ID
            if (url.startsWith('/api/itens/')) {
                const id = parseInt(url.split('/').pop() || '0');
                const itemRemovido = global.itens.find(i => i.id === id);
                global.itens = global.itens.filter(i => i.id !== id);
                
                console.log(`🗑️ Item removido: ${itemRemovido?.nome || id}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item removido',
                    data: itemRemovido
                }));
                return;
            }

            // Remover defeito por ID
            if (url.startsWith('/api/defeitos/')) {
                const id = parseInt(url.split('/').pop() || '0');
                const defeitoRemovido = global.defeitos.find(d => d.id === id);
                global.defeitos = global.defeitos.filter(d => d.id !== id);
                
                console.log(`🗑️ Defeito removido ID: ${id}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito removido'
                }));
                return;
            }

            // Remover comentário por ID
            if (url.startsWith('/api/comentarios/')) {
                const id = parseInt(url.split('/').pop() || '0');
                global.comentarios = global.comentarios.filter(c => c.id !== id);
                
                console.log(`🗑️ Comentário removido ID: ${id}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Comentário removido'
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
