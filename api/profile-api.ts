import { IncomingMessage, ServerResponse } from "node:http";

// ==================== INTERFACES ====================
interface Usuario {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    departamento: string;
    cargo: string;
    avatar?: string;
    dataCadastro: string;
    ultimoAcesso?: string;
    estatisticas: {
        itensGerenciados: number;
        itensAdicionados: number;
        manutencoesSolicitadas: number;
        relatoriosGerados: number;
    };
    configuracoes: {
        notificacoesEmail: boolean;
        autenticacaoDoisFatores: boolean;
        modoEscuro: boolean;
    };
    atividades: Atividade[];
}

interface Atividade {
    id: number;
    acao: string;
    descricao: string;
    data: string;
    icone: string;
    itemId?: number;
}

interface AlteracaoSenha {
    usuarioId: number;
    senhaAtual: string;
    novaSenha: string;
}

// ==================== ARRAY GLOBAL ====================
declare global {
    var usuarios: Usuario[];
    var sessoes: Map<string, number>; // token -> usuarioId
}

if (!global.usuarios) {
    const agora = new Date();
    global.usuarios = [
        {
            id: 1,
            nome: "User Name",
            email: "user@senacestoque.com",
            telefone: "(11) 99999-9999",
            departamento: "Tecnologia da Informação",
            cargo: "Administrador do Sistema",
            avatar: "https://ui-avatars.com/api/?name=User+Name&background=1e3a8a&color=fff&size=128",
            dataCadastro: "Jan/2023",
            ultimoAcesso: agora.toLocaleString('pt-BR'),
            estatisticas: {
                itensGerenciados: 150,
                itensAdicionados: 142,
                manutencoesSolicitadas: 8,
                relatoriosGerados: 24
            },
            configuracoes: {
                notificacoesEmail: true,
                autenticacaoDoisFatores: false,
                modoEscuro: false
            },
            atividades: [
                {
                    id: 1,
                    acao: "Adicionou novo item ao estoque",
                    descricao: "Monitor Dell 24\" foi adicionado ao estoque",
                    data: "Hoje, 10:30 AM",
                    icone: "fa-box-open",
                    itemId: 1
                },
                {
                    id: 2,
                    acao: "Solicitou manutenção",
                    descricao: "Teclado Mecânico enviado para manutenção",
                    data: "Ontem, 03:15 PM",
                    icone: "fa-tools",
                    itemId: 4
                },
                {
                    id: 3,
                    acao: "Exportou relatório mensal",
                    descricao: "Relatório de estoque - Novembro 2023",
                    data: "2 dias atrás",
                    icone: "fa-file-export"
                },
                {
                    id: 4,
                    acao: "Atualizou status de item",
                    descricao: "Notebook Dell marcado como \"Em Uso\"",
                    data: "3 dias atrás",
                    icone: "fa-check-circle",
                    itemId: 2
                }
            ]
        }
    ];
}

if (!global.sessoes) {
    global.sessoes = new Map();
}

// ==================== FUNÇÕES AUXILIARES ====================
function getUsuarioIdFromRequest(request: IncomingMessage): number | null {
    // Em produção, isso viria de um token JWT ou sessão
    // Por enquanto, retorna o ID 1 (usuário padrão)
    return 1;
}

function adicionarAtividade(usuarioId: number, atividade: Omit<Atividade, 'id'>) {
    const usuario = global.usuarios.find(u => u.id === usuarioId);
    if (usuario) {
        const novaAtividade: Atividade = {
            id: Date.now(),
            ...atividade
        };
        usuario.atividades.unshift(novaAtividade);
        // Manter apenas as 10 atividades mais recentes
        if (usuario.atividades.length > 10) {
            usuario.atividades = usuario.atividades.slice(0, 10);
        }
    }
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
        // Obter ID do usuário logado
        const usuarioId = getUsuarioIdFromRequest(request);
        if (!usuarioId) {
            response.statusCode = 401;
            response.end(JSON.stringify({
                success: false,
                error: 'Usuário não autenticado'
            }));
            return;
        }

        const usuario = global.usuarios.find(u => u.id === usuarioId);
        if (!usuario) {
            response.statusCode = 404;
            response.end(JSON.stringify({
                success: false,
                error: 'Usuário não encontrado'
            }));
            return;
        }

        // ==================== GET ====================
        if (method === 'GET') {
            // Dados completos do perfil
            if (url === '/api/profile' || url === '/api/profile-api') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email,
                        telefone: usuario.telefone,
                        departamento: usuario.departamento,
                        cargo: usuario.cargo,
                        avatar: usuario.avatar,
                        dataCadastro: usuario.dataCadastro,
                        ultimoAcesso: usuario.ultimoAcesso,
                        estatisticas: usuario.estatisticas,
                        configuracoes: usuario.configuracoes
                    }
                }));
                return;
            }

            // Atividades do usuário
            if (url === '/api/profile/atividades') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: usuario.atividades
                }));
                return;
            }

            // Estatísticas do usuário
            if (url === '/api/profile/estatisticas') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: usuario.estatisticas
                }));
                return;
            }

            // Configurações do usuário
            if (url === '/api/profile/configuracoes') {
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    data: usuario.configuracoes
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

            // Login (simulado)
            if (url === '/api/profile/login') {
                const { email, senha } = data;
                
                // Simular verificação de login
                if (email === usuario.email && senha === 'senha123') {
                    const token = Date.now().toString();
                    global.sessoes.set(token, usuario.id);
                    
                    usuario.ultimoAcesso = new Date().toLocaleString('pt-BR');
                    
                    response.statusCode = 200;
                    response.end(JSON.stringify({
                        success: true,
                        message: 'Login realizado com sucesso',
                        data: {
                            token,
                            usuario: {
                                id: usuario.id,
                                nome: usuario.nome,
                                email: usuario.email
                            }
                        }
                    }));
                } else {
                    response.statusCode = 401;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Email ou senha inválidos'
                    }));
                }
                return;
            }

            // Upload de avatar
            if (url === '/api/profile/avatar') {
                const { avatar } = data;
                
                if (avatar) {
                    usuario.avatar = avatar;
                    
                    adicionarAtividade(usuarioId, {
                        acao: "Avatar atualizado",
                        descricao: "Foto de perfil alterada",
                        data: "Agora mesmo",
                        icone: "fa-camera"
                    });
                    
                    response.statusCode = 200;
                    response.end(JSON.stringify({
                        success: true,
                        message: 'Avatar atualizado com sucesso',
                        data: { avatar: usuario.avatar }
                    }));
                } else {
                    response.statusCode = 400;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Avatar não fornecido'
                    }));
                }
                return;
            }

            // Adicionar atividade
            if (url === '/api/profile/atividades') {
                const { acao, descricao, icone, itemId } = data;
                
                adicionarAtividade(usuarioId, {
                    acao,
                    descricao,
                    data: "Agora mesmo",
                    icone: icone || "fa-history",
                    itemId
                });
                
                response.statusCode = 201;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Atividade registrada',
                    data: usuario.atividades[0]
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

            // Atualizar dados do perfil
            if (url === '/api/profile') {
                const camposPermitidos = ['nome', 'email', 'telefone', 'departamento', 'cargo'];
                
                camposPermitidos.forEach(campo => {
                    if (data[campo] !== undefined) {
                        (usuario as any)[campo] = data[campo];
                    }
                });
                
                adicionarAtividade(usuarioId, {
                    acao: "Perfil atualizado",
                    descricao: "Dados pessoais alterados",
                    data: "Agora mesmo",
                    icone: "fa-user-edit"
                });
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Perfil atualizado com sucesso',
                    data: {
                        nome: usuario.nome,
                        email: usuario.email,
                        telefone: usuario.telefone,
                        departamento: usuario.departamento,
                        cargo: usuario.cargo
                    }
                }));
                return;
            }

            // Atualizar configurações
            if (url === '/api/profile/configuracoes') {
                const { notificacoesEmail, autenticacaoDoisFatores, modoEscuro } = data;
                
                if (notificacoesEmail !== undefined) {
                    usuario.configuracoes.notificacoesEmail = notificacoesEmail;
                }
                if (autenticacaoDoisFatores !== undefined) {
                    usuario.configuracoes.autenticacaoDoisFatores = autenticacaoDoisFatores;
                }
                if (modoEscuro !== undefined) {
                    usuario.configuracoes.modoEscuro = modoEscuro;
                }
                
                adicionarAtividade(usuarioId, {
                    acao: "Configurações alteradas",
                    descricao: "Preferências do usuário atualizadas",
                    data: "Agora mesmo",
                    icone: "fa-cog"
                });
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Configurações salvas',
                    data: usuario.configuracoes
                }));
                return;
            }

            // Alterar senha
            if (url === '/api/profile/senha') {
                const { senhaAtual, novaSenha } = data;
                
                // Simular verificação de senha
                if (senhaAtual !== 'senha123') {
                    response.statusCode = 401;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'Senha atual incorreta'
                    }));
                    return;
                }
                
                if (novaSenha.length < 8) {
                    response.statusCode = 400;
                    response.end(JSON.stringify({
                        success: false,
                        error: 'A nova senha deve ter pelo menos 8 caracteres'
                    }));
                    return;
                }
                
                adicionarAtividade(usuarioId, {
                    acao: "Senha alterada",
                    descricao: "Senha de acesso modificada",
                    data: "Agora mesmo",
                    icone: "fa-key"
                });
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Senha alterada com sucesso'
                }));
                return;
            }
        }

        // ==================== DELETE ====================
        if (method === 'DELETE') {
            // Excluir conta
            if (url === '/api/profile') {
                const index = global.usuarios.findIndex(u => u.id === usuarioId);
                if (index !== -1) {
                    global.usuarios.splice(index, 1);
                }
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Conta excluída com sucesso'
                }));
                return;
            }

            // Remover atividade
            if (url.startsWith('/api/profile/atividades/')) {
                const atividadeId = parseInt(url.split('/').pop() || '0');
                usuario.atividades = usuario.atividades.filter(a => a.id !== atividadeId);
                
                response.statusCode = 200;
                response.end(JSON.stringify({
                    success: true,
                    message: 'Atividade removida'
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
