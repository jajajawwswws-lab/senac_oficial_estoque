import { IncomingMessage, ServerResponse } from "node:http";

// ==================== INTERFACES ====================
interface Item {
    id: number;
    nome: string;
    categoria: string;
    localizacao: string;
    responsavel: string;
    status: 'em_uso' | 'defeito' | 'manutencao';
    dataCadastro: string;
    dataHora?: string;
    patrimonio?: string;
    observacoes?: string;
}

interface Defeito {
    id: number;
    itemId: number;
    item: string;
    defeito: string;
    prioridade: 'alta' | 'media' | 'baixa';
    data: string;
    hora: string;
    responsavel: string;
    status: 'pendente' | 'em_andamento' | 'resolvido';
    observacoes?: string;
}

interface Manutencao {
    id: number;
    itemId: number;
    item: string;
    descricao: string;
    tipo: 'preventiva' | 'corretiva' | 'reparo';
    prioridade: 'alta' | 'media' | 'baixa';
    dataInicio: string;
    previsao: string;
    dataConclusao?: string;
    responsavel: string;
    status: 'aguardando' | 'em_andamento' | 'concluido' | 'cancelado';
    observacoes?: string;
}

interface Comentario {
    id: number;
    itemId: number;
    item: string;
    comentario: string;
    data: string;
    hora: string;
    autor?: string;
}

interface Historico {
    id: number;
    acao: string;
    item: string;
    itemId?: number;
    data: string;
    hora: string;
    usuario?: string;
}

// ==================== ARRAY GLOBAL ====================
declare global {
    var itens: Item[];
    var defeitos: Defeito[];
    var manutencoes: Manutencao[];
    var comentarios: Comentario[];
    var historico: Historico[];
}

// ==================== DADOS INICIAIS ====================
if (!global.itens) {
    const agora = new Date();
    global.itens = [
        {
            id: 1,
            nome: "Monitor Dell 24\"",
            categoria: "Eletrônicos",
            localizacao: "Sala 201",
            responsavel: "João Silva",
            status: "em_uso",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR'),
            patrimonio: "PAT-001",
            observacoes: ""
        },
        {
            id: 2,
            nome: "Notebook Dell XPS",
            categoria: "Eletrônicos",
            localizacao: "Sala 302",
            responsavel: "Maria Santos",
            status: "em_uso",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR'),
            patrimonio: "PAT-002",
            observacoes: ""
        },
        {
            id: 3,
            nome: "Cadeira Ergonômica",
            categoria: "Mobília",
            localizacao: "Sala 105",
            responsavel: "Pedro Costa",
            status: "em_uso",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR'),
            patrimonio: "PAT-003",
            observacoes: ""
        },
        {
            id: 4,
            nome: "Teclado Mecânico",
            categoria: "Periféricos",
            localizacao: "Sala 201",
            responsavel: "João Silva",
            status: "defeito",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR'),
            patrimonio: "PAT-004",
            observacoes: "Teclas travando"
        },
        {
            id: 5,
            nome: "Mouse sem fio",
            categoria: "Periféricos",
            localizacao: "Sala 302",
            responsavel: "Maria Santos",
            status: "manutencao",
            dataCadastro: agora.toLocaleDateString('pt-BR'),
            dataHora: agora.toLocaleString('pt-BR'),
            patrimonio: "PAT-005",
            observacoes: "Não conecta"
        }
    ];
}

if (!global.defeitos) {
    global.defeitos = [
        {
            id: 1001,
            itemId: 4,
            item: "Teclado Mecânico",
            defeito: "Teclas Z, X e C estão travando",
            prioridade: "alta",
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR'),
            responsavel: "João Silva",
            status: "pendente",
            observacoes: "Teclas mecânicas com problema"
        }
    ];
}

if (!global.manutencoes) {
    global.manutencoes = [
        {
            id: 2001,
            itemId: 5,
            item: "Mouse sem fio",
            descricao: "Mouse não conecta via USB",
            tipo: "reparo",
            prioridade: "media",
            dataInicio: new Date().toLocaleDateString('pt-BR'),
            previsao: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            responsavel: "Carlos Técnico",
            status: "em_andamento",
            observacoes: "Testar com outro receptor"
        }
    ];
}

if (!global.comentarios) {
    global.comentarios = [];
}

if (!global.historico) {
    global.historico = [];
}

// ==================== FUNÇÕES AUXILIARES ====================
function adicionarHistorico(acao: string, item: string, itemId?: number) {
    const agora = new Date();
    global.historico.push({
        id: Date.now(),
        acao: acao,
        item: item,
        itemId: itemId,
        data: agora.toLocaleDateString('pt-BR'),
        hora: agora.toLocaleTimeString('pt-BR'),
        usuario: "sistema"
    });
}

// ==================== SERVER REQUEST ====================
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
            // Dashboard - estatísticas completas
            if (url === '/api/dashboard') {
                const emUso = global.itens.filter(i => i.status === 'em_uso').length;
                const comDefeito = global.itens.filter(i => i.status === 'defeito').length;
                const emManutencao = global.itens.filter(i => i.status === 'manutencao').length;
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: {
                        estatisticas: {
                            total: global.itens.length,
                            emUso,
                            comDefeito,
                            emManutencao
                        },
                        itens: global.itens,
                        defeitos: global.defeitos,
                        manutencoes: global.manutencoes,
                        comentarios: global.comentarios,
                        historico: global.historico.slice(-10)
                    }
                }));
                return;
            }

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

            // Listar manutenções
            if (url === '/api/manutencoes') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.manutencoes
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

            // Listar histórico
            if (url === '/api/historico') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: global.historico
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
                        total: global.itens.length,
                        defeitosPendentes: global.defeitos.filter(d => d.status === 'pendente').length,
                        manutencoesAndamento: global.manutencoes.filter(m => m.status === 'em_andamento').length
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
            const agora = new Date();

            // Adicionar novo item
            if (url === '/api/itens' || url === '/api/account-api') {
                const novoId = global.itens.length > 0 
                    ? Math.max(...global.itens.map(i => i.id)) + 1 
                    : 1;
                
                const novoItem: Item = {
                    id: novoId,
                    nome: data.nome,
                    categoria: data.categoria,
                    localizacao: data.localizacao,
                    responsavel: data.responsavel,
                    patrimonio: data.patrimonio || `PAT-${String(novoId).padStart(3, '0')}`,
                    status: data.status || 'em_uso',
                    dataCadastro: agora.toLocaleDateString('pt-BR'),
                    dataHora: agora.toLocaleString('pt-BR'),
                    observacoes: data.observacoes || ''
                };
                
                global.itens.push(novoItem);
                adicionarHistorico('Novo item adicionado', novoItem.nome, novoItem.id);
                
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
                const novoDefeito: Defeito = {
                    id: Date.now(),
                    itemId: data.itemId,
                    item: data.item,
                    defeito: data.defeito,
                    prioridade: data.prioridade || 'media',
                    data: agora.toLocaleDateString('pt-BR'),
                    hora: agora.toLocaleTimeString('pt-BR'),
                    responsavel: data.responsavel,
                    status: data.status || 'pendente',
                    observacoes: data.observacoes
                };
                
                global.defeitos.push(novoDefeito);
                
                // Atualizar status do item
                const item = global.itens.find(i => i.id === data.itemId);
                if (item) {
                    item.status = 'defeito';
                    item.observacoes = data.defeito;
                }
                
                adicionarHistorico('Defeito reportado', data.item, data.itemId);
                console.log(`🔧 Defeito registrado: ${data.item}`);
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito registrado',
                    data: novoDefeito
                }));
                return;
            }

            // Registrar manutenção
            if (url === '/api/manutencoes') {
                const novaManutencao: Manutencao = {
                    id: Date.now(),
                    itemId: data.itemId,
                    item: data.item,
                    descricao: data.descricao,
                    tipo: data.tipo || 'reparo',
                    prioridade: data.prioridade || 'media',
                    dataInicio: agora.toLocaleDateString('pt-BR'),
                    previsao: data.previsao,
                    responsavel: data.responsavel,
                    status: data.status || 'em_andamento',
                    observacoes: data.observacoes
                };
                
                global.manutencoes.push(novaManutencao);
                
                // Atualizar status do item
                const item = global.itens.find(i => i.id === data.itemId);
                if (item) {
                    item.status = 'manutencao';
                    item.observacoes = data.descricao;
                }
                
                adicionarHistorico('Item enviado para manutenção', data.item, data.itemId);
                console.log(`🔨 Manutenção registrada: ${data.item}`);
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Manutenção registrada',
                    data: novaManutencao
                }));
                return;
            }

            // Adicionar comentário
            if (url === '/api/comentarios') {
                const novoComentario: Comentario = {
                    id: Date.now(),
                    itemId: data.itemId,
                    item: data.item,
                    comentario: data.comentario,
                    data: agora.toLocaleDateString('pt-BR'),
                    hora: agora.toLocaleTimeString('pt-BR'),
                    autor: data.autor || 'Usuário'
                };
                
                global.comentarios.push(novoComentario);
                adicionarHistorico('Comentário adicionado', data.item, data.itemId);
                
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
            const agora = new Date();

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
                
                global.itens[itemIndex] = {
                    ...global.itens[itemIndex],
                    ...data,
                    id: global.itens[itemIndex].id
                };
                
                adicionarHistorico('Item atualizado', global.itens[itemIndex].nome, id);
                console.log(`📝 Item atualizado: ${global.itens[itemIndex].nome}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Item atualizado',
                    data: global.itens[itemIndex]
                }));
                return;
            }

            // Atualizar status do item
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
                
                const statusAntigo = item.status;
                item.status = data.status;
                item.observacoes = data.observacoes || item.observacoes;
                
                adicionarHistorico(`Status alterado: ${statusAntigo} → ${data.status}`, item.nome, item.id);
                console.log(`🔄 Status do item ${item.nome} alterado para: ${data.status}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Status atualizado',
                    data: item
                }));
                return;
            }

            // Resolver defeito
            if (url.startsWith('/api/defeitos/') && url.endsWith('/resolver')) {
                const id = parseInt(url.split('/')[3]);
                const defeitoIndex = global.defeitos.findIndex(d => d.id === id);
                
                if (defeitoIndex === -1) {
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Defeito não encontrado'
                    }));
                    return;
                }
                
                const defeito = global.defeitos[defeitoIndex];
                defeito.status = 'resolvido';
                
                // Atualizar status do item
                const item = global.itens.find(i => i.id === defeito.itemId);
                if (item) {
                    item.status = 'em_uso';
                }
                
                adicionarHistorico('Defeito resolvido', defeito.item, defeito.itemId);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Defeito resolvido',
                    data: defeito
                }));
                return;
            }

            // Concluir manutenção
            if (url.startsWith('/api/manutencoes/') && url.endsWith('/concluir')) {
                const id = parseInt(url.split('/')[3]);
                const manutencaoIndex = global.manutencoes.findIndex(m => m.id === id);
                
                if (manutencaoIndex === -1) {
                    response.statusCode = 404;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Manutenção não encontrada'
                    }));
                    return;
                }
                
                const manutencao = global.manutencoes[manutencaoIndex];
                manutencao.status = 'concluido';
                manutencao.dataConclusao = agora.toLocaleDateString('pt-BR');
                
                // Atualizar status do item
                const item = global.itens.find(i => i.id === manutencao.itemId);
                if (item) {
                    item.status = 'em_uso';
                }
                
                adicionarHistorico('Manutenção concluída', manutencao.item, manutencao.itemId);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Manutenção concluída',
                    data: manutencao
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
                
                // Remover também defeitos e manutenções relacionados
                global.defeitos = global.defeitos.filter(d => d.itemId !== id);
                global.manutencoes = global.manutencoes.filter(m => m.itemId !== id);
                global.comentarios = global.comentarios.filter(c => c.itemId !== id);
                
                if (itemRemovido) {
                    adicionarHistorico('Item removido', itemRemovido.nome, id);
                }
                
                console.log(`🗑️ Item removido ID: ${id}`);
                
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
                    message: 'Defeito removido',
                    data: defeitoRemovido
                }));
                return;
            }

            // Remover manutenção por ID
            if (url.startsWith('/api/manutencoes/')) {
                const id = parseInt(url.split('/').pop() || '0');
                const manutencaoRemovida = global.manutencoes.find(m => m.id === id);
                global.manutencoes = global.manutencoes.filter(m => m.id !== id);
                
                console.log(`🗑️ Manutenção removida ID: ${id}`);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Manutenção removida',
                    data: manutencaoRemovida
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
