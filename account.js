// account.js - VERSÃO COMPLETA COM TODAS AS FUNCIONALIDADES
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");
    
    // ==================== DADOS INICIAIS ====================
    inicializarDados();
    
    // ==================== CARREGAR TUDO ====================
    function carregarTudo() {
        carregarTabelaItens();
        carregarItensDefeito();
        carregarItensManutencao();
        carregarGrafico();
        carregarAtividadesRecentes();
        carregarEstatisticas();
    }
    
    carregarTudo();
    
    // ==================== INICIALIZAR DADOS ====================
    function inicializarDados() {
        if (!localStorage.getItem('itens')) {
            const itensIniciais = [
                {
                    id: 1,
                    nome: "Monitor Dell 24\"",
                    categoria: "Eletrônicos",
                    localizacao: "Sala 201",
                    responsavel: "João Silva",
                    status: "em_uso",
                    dataCadastro: new Date().toLocaleDateString('pt-BR'),
                    dataHora: new Date().toLocaleString('pt-BR'),
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
                    dataCadastro: new Date().toLocaleDateString('pt-BR'),
                    dataHora: new Date().toLocaleString('pt-BR'),
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
                    dataCadastro: new Date().toLocaleDateString('pt-BR'),
                    dataHora: new Date().toLocaleString('pt-BR'),
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
                    dataCadastro: new Date().toLocaleDateString('pt-BR'),
                    dataHora: new Date().toLocaleString('pt-BR'),
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
                    dataCadastro: new Date().toLocaleDateString('pt-BR'),
                    dataHora: new Date().toLocaleString('pt-BR'),
                    patrimonio: "PAT-005",
                    observacoes: "Não conecta"
                }
            ];
            localStorage.setItem('itens', JSON.stringify(itensIniciais));
        }
        
        if (!localStorage.getItem('defeitos')) {
            const defeitosIniciais = [
                {
                    id: 1001,
                    itemId: 4,
                    item: "Teclado Mecânico",
                    defeito: "Teclas travando",
                    prioridade: "alta",
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR'),
                    responsavel: "João Silva",
                    status: "pendente",
                    observacoes: "Teclas Z, X, C estão travando"
                }
            ];
            localStorage.setItem('defeitos', JSON.stringify(defeitosIniciais));
        }
        
        if (!localStorage.getItem('manutencoes')) {
            const manutencoesIniciais = [
                {
                    id: 2001,
                    itemId: 5,
                    item: "Mouse sem fio",
                    descricao: "Não conecta ao computador",
                    tipo: "reparo",
                    prioridade: "media",
                    dataInicio: new Date().toLocaleDateString('pt-BR'),
                    previsao: new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('pt-BR'),
                    responsavel: "Carlos Tecnico",
                    status: "em_andamento",
                    observacoes: "Testar com outro receptor"
                }
            ];
            localStorage.setItem('manutencoes', JSON.stringify(manutencoesIniciais));
        }
        
        if (!localStorage.getItem('comentarios')) {
            localStorage.setItem('comentarios', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('historico')) {
            localStorage.setItem('historico', JSON.stringify([]));
        }
    }
    
    // ==================== GRÁFICO ====================
    function carregarGrafico() {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const emUso = itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = itens.filter(i => i.status === 'defeito').length;
        const manutencao = itens.filter(i => i.status === 'manutencao').length;
        const total = itens.length;
        
        // Destruir gráfico antigo se existir
        if (window.meuGrafico) {
            window.meuGrafico.destroy();
        }
        
        window.meuGrafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Em Uso', 'Com Defeito', 'Em Manutenção'],
                datasets: [{
                    data: [emUso, comDefeito, manutencao],
                    backgroundColor: ['#10B981', '#EF4444', '#F97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // ==================== ESTATÍSTICAS ====================
    function carregarEstatisticas() {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
        
        const statsContainer = document.createElement('div');
        statsContainer.className = 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6';
        statsContainer.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-4">
                <div class="flex items-center">
                    <div class="p-3 bg-blue-100 rounded-full mr-4">
                        <i class="fas fa-boxes text-blue-800 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Total de Itens</p>
                        <p class="text-2xl font-bold">${itens.length}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-4">
                <div class="flex items-center">
                    <div class="p-3 bg-green-100 rounded-full mr-4">
                        <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Em Uso</p>
                        <p class="text-2xl font-bold">${itens.filter(i => i.status === 'em_uso').length}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-4">
                <div class="flex items-center">
                    <div class="p-3 bg-red-100 rounded-full mr-4">
                        <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Com Defeito</p>
                        <p class="text-2xl font-bold">${itens.filter(i => i.status === 'defeito').length}</p>
                    </div>
                </div>
            </div>
            <div class="bg-white rounded-xl shadow-sm p-4">
                <div class="flex items-center">
                    <div class="p-3 bg-orange-100 rounded-full mr-4">
                        <i class="fas fa-tools text-orange-600 text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Em Manutenção</p>
                        <p class="text-2xl font-bold">${itens.filter(i => i.status === 'manutencao').length}</p>
                    </div>
                </div>
            </div>
        `;
        
        const graficoDiv = document.querySelector('.lg\\:col-span-2');
        if (graficoDiv) {
            graficoDiv.parentNode.insertBefore(statsContainer, graficoDiv);
        }
    }
    
    // ==================== TABELA DE ITENS ====================
    function carregarTabelaItens() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        tbody.innerHTML = '';
        
        itens.sort((a, b) => a.id - b.id).forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.patrimonio || `#ITM-${String(item.id).padStart(3, '0')}`}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.nome}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.categoria}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.localizacao}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.responsavel}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs rounded-full ${
                        item.status === 'em_uso' ? 'bg-green-100 text-green-800' :
                        item.status === 'defeito' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                    }">
                        ${item.status === 'em_uso' ? 'Em Uso' : item.status === 'defeito' ? 'Com Defeito' : 'Em Manutenção'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="visual text-blue-600 hover:text-blue-900 mr-2" data-id="${item.id}" title="Visualizar"><i class="fas fa-eye"></i></button>
                    <button class="comentario text-orange hover:text-orange-600 mr-2" data-id="${item.id}" title="Comentar"><i class="fas fa-edit"></i></button>
                    <button class="defeito text-red-600 hover:text-red-800 mr-2" data-id="${item.id}" title="Reportar Defeito"><i class="fas fa-exclamation-triangle"></i></button>
                    <button class="manutencao text-purple-600 hover:text-purple-800 mr-2" data-id="${item.id}" title="Enviar para Manutenção"><i class="fas fa-tools"></i></button>
                    <button class="lixeira text-gray-600 hover:text-gray-800" data-id="${item.id}" title="Remover"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        configurarBotoesTabela();
    }
    
    // ==================== ITENS COM DEFEITO - VERSÃO MELHORADA ====================
    function carregarItensDefeito() {
        const container = document.querySelector('#defective-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        const itensDefeito = itens.filter(i => i.status === 'defeito');
        
        container.innerHTML = '';
        
        if (itensDefeito.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-check-circle text-green-500 text-5xl mb-3"></i>
                    <p class="text-gray-500">Nenhum item com defeito no momento</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por prioridade
        const prioridadeOrder = { 'alta': 1, 'media': 2, 'baixa': 3 };
        defeitos.sort((a, b) => (prioridadeOrder[a.prioridade] || 99) - (prioridadeOrder[b.prioridade] || 99));
        
        itensDefeito.forEach(item => {
            const defeito = defeitos.find(d => d.itemId === item.id) || { 
                defeito: item.observacoes || 'Defeito não especificado',
                prioridade: 'media',
                responsavel: item.responsavel,
                data: new Date().toLocaleDateString('pt-BR')
            };
            
            const div = document.createElement('div');
            div.className = `flex items-center justify-between p-4 rounded-lg ${
                defeito.prioridade === 'alta' ? 'bg-red-100 border-l-4 border-red-600' :
                defeito.prioridade === 'media' ? 'bg-orange-50 border-l-4 border-orange-400' :
                'bg-yellow-50 border-l-4 border-yellow-400'
            }`;
            div.innerHTML = `
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <p class="font-medium text-gray-900">${item.nome}</p>
                        <span class="ml-3 px-2 py-1 text-xs rounded-full ${
                            defeito.prioridade === 'alta' ? 'bg-red-200 text-red-800' :
                            defeito.prioridade === 'media' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                        }">
                            Prioridade ${defeito.prioridade || 'media'}
                        </span>
                    </div>
                    <p class="text-sm text-gray-700 mb-1">${defeito.defeito}</p>
                    <div class="flex items-center text-xs text-gray-500 space-x-4">
                        <span><i class="fas fa-user mr-1"></i> ${defeito.responsavel || item.responsavel}</span>
                        <span><i class="fas fa-calendar mr-1"></i> ${defeito.data}</span>
                    </div>
                </div>
                <div class="flex flex-col space-y-2 ml-4">
                    <button class="btn-editar-defeito text-blue-600 hover:text-blue-800 text-sm" data-id="${item.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-resolver-defeito text-green-600 hover:text-green-800 text-sm" data-id="${item.id}">
                        <i class="fas fa-check"></i> Resolver
                    </button>
                    <button class="btn-manutencao-defeito text-orange-600 hover:text-orange-800 text-sm" data-id="${item.id}">
                        <i class="fas fa-tools"></i> Manutenção
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
        
        configurarBotoesDefeito();
    }
    
    // ==================== ITENS EM MANUTENÇÃO - VERSÃO MELHORADA ====================
    function carregarItensManutencao() {
        const container = document.querySelector('#maintenance-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
        const itensManutencao = itens.filter(i => i.status === 'manutencao');
        
        container.innerHTML = '';
        
        if (itensManutencao.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-wrench text-gray-400 text-5xl mb-3"></i>
                    <p class="text-gray-500">Nenhum item em manutenção</p>
                </div>
            `;
            return;
        }
        
        itensManutencao.forEach(item => {
            const manutencao = manutencoes.find(m => m.itemId === item.id) || {
                tipo: 'reparo',
                descricao: item.observacoes || 'Em manutenção',
                previsao: new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('pt-BR'),
                responsavel: 'Técnico',
                status: 'em_andamento'
            };
            
            const diasRestantes = Math.ceil((new Date(manutencao.previsao) - new Date()) / (1000 * 60 * 60 * 24));
            
            const div = document.createElement('div');
            div.className = `p-4 rounded-lg ${
                diasRestantes < 0 ? 'bg-red-50' :
                diasRestantes <= 2 ? 'bg-yellow-50' :
                'bg-orange-50'
            }`;
            div.innerHTML = `
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <div class="flex items-center mb-2">
                            <p class="font-medium text-gray-900">${item.nome}</p>
                            <span class="ml-3 px-2 py-1 text-xs rounded-full ${
                                manutencao.status === 'concluido' ? 'bg-green-100 text-green-800' :
                                manutencao.status === 'em_andamento' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }">
                                ${manutencao.status === 'concluido' ? 'Concluído' : 
                                  manutencao.status === 'em_andamento' ? 'Em Andamento' : 'Aguardando'}
                            </span>
                        </div>
                        <p class="text-sm text-gray-700 mb-2">${manutencao.descricao}</p>
                        <div class="grid grid-cols-2 gap-2 text-xs text-gray-500">
                            <span><i class="fas fa-tag mr-1"></i> ${manutencao.tipo || 'Reparo'}</span>
                            <span><i class="fas fa-user mr-1"></i> ${manutencao.responsavel}</span>
                            <span><i class="fas fa-calendar mr-1"></i> Previsão: ${manutencao.previsao}</span>
                            <span class="${diasRestantes < 0 ? 'text-red-600 font-bold' : ''}">
                                <i class="fas fa-clock mr-1"></i> 
                                ${diasRestantes < 0 ? 'Atrasado' : `${diasRestantes} dias`}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <button class="btn-concluir-manutencao text-green-600 hover:text-green-800 text-sm px-3 py-1" data-id="${item.id}">
                        <i class="fas fa-check mr-1"></i> Concluir
                    </button>
                    <button class="btn-editar-manutencao text-blue-600 hover:text-blue-800 text-sm px-3 py-1" data-id="${item.id}">
                        <i class="fas fa-edit mr-1"></i> Editar
                    </button>
                    <button class="btn-cancelar-manutencao text-red-600 hover:text-red-800 text-sm px-3 py-1" data-id="${item.id}">
                        <i class="fas fa-times mr-1"></i> Cancelar
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
        
        configurarBotoesManutencao();
    }
    
    // ==================== ATIVIDADES RECENTES ====================
    function carregarAtividadesRecentes() {
        const container = document.querySelector('.lg\\:col-span-2 + div .space-y-4');
        if (!container) return;
        
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        const atividades = historico.slice(-5).reverse();
        
        container.innerHTML = '';
        
        if (atividades.length === 0) {
            // Atividades padrão se não houver histórico
            const defaultAtividades = [
                { acao: 'Novo item adicionado', item: 'Monitor Dell 24"', tempo: '2 minutos atrás', icon: 'fa-box-open', bg: 'bg-blue-100', text: 'text-blue-800' },
                { acao: 'Item enviado para manutenção', item: 'Teclado Mecânico', tempo: '15 minutos atrás', icon: 'fa-tools', bg: 'bg-orange-100', text: 'text-orange-600' },
                { acao: 'Item marcado como defeituoso', item: 'Mouse sem fio', tempo: '1 hora atrás', icon: 'fa-exclamation-triangle', bg: 'bg-red-100', text: 'text-red-600' },
                { acao: 'Item consertado', item: 'Notebook Dell', tempo: '3 horas atrás', icon: 'fa-check-circle', bg: 'bg-green-100', text: 'text-green-600' },
                { acao: 'Item em manutenção', item: 'Impressora HP', tempo: '5 horas atrás', icon: 'fa-wrench', bg: 'bg-purple-100', text: 'text-purple-600' }
            ];
            
            defaultAtividades.forEach(ativ => {
                adicionarAtividadeDOM(container, ativ);
            });
        } else {
            atividades.forEach(ativ => {
                adicionarAtividadeDOM(container, ativ);
            });
        }
    }
    
    function adicionarAtividadeDOM(container, ativ) {
        const div = document.createElement('div');
        div.className = 'flex items-start hover:bg-gray-50 p-2 rounded-lg transition-colors';
        div.innerHTML = `
            <div class="p-2 ${ativ.bg} rounded-lg ${ativ.text} mr-3">
                <i class="fas ${ativ.icon}"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${ativ.acao}</p>
                <p class="text-xs text-gray-500">${ativ.item} - ${ativ.tempo}</p>
            </div>
        `;
        container.appendChild(div);
    }
    
    function registrarAtividade(acao, item, icon = 'fa-box-open', bg = 'bg-blue-100', text = 'text-blue-800') {
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.push({
            acao,
            item,
            tempo: 'agora mesmo',
            icon,
            bg,
            text,
            data: new Date().toLocaleString('pt-BR')
        });
        localStorage.setItem('historico', JSON.stringify(historico));
        carregarAtividadesRecentes();
    }
    
    // ==================== BOTÃO ADICIONAR ITEM ====================
    document.getElementById("btnAdicionarItem")?.addEventListener("click", () => {
        const nome = prompt("Nome do item:");
        if (!nome) return;
        
        const categoria = prompt("Categoria:");
        if (!categoria) return;
        
        const localizacao = prompt("Localização:");
        if (!localizacao) return;
        
        const responsavel = prompt("Responsável:");
        if (!responsavel) return;
        
        const patrimonio = prompt("Número de Patrimônio (opcional):");
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const novoId = itens.length > 0 ? Math.max(...itens.map(i => i.id)) + 1 : 1;
        
        const novoItem = {
            id: novoId,
            nome: nome,
            categoria: categoria,
            localizacao: localizacao,
            responsavel: responsavel,
            patrimonio: patrimonio || `PAT-${String(novoId).padStart(3, '0')}`,
            status: 'em_uso',
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            dataHora: new Date().toLocaleString('pt-BR'),
            observacoes: ""
        };
        
        itens.push(novoItem);
        localStorage.setItem('itens', JSON.stringify(itens));
        
        registrarAtividade('Novo item adicionado', nome, 'fa-box-open', 'bg-blue-100', 'text-blue-800');
        
        alert("✅ Item adicionado com sucesso!");
        carregarTudo();
    });
    
    // ==================== CONFIGURAR BOTÕES DA TABELA ====================
    function configurarBotoesTabela() {
        // Botões visualizar
        document.querySelectorAll(".visual").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (item) {
                    alert(`📋 DETALHES DO ITEM\n\n` +
                          `ID: ${item.patrimonio}\n` +
                          `Nome: ${item.nome}\n` +
                          `Categoria: ${item.categoria}\n` +
                          `Localização: ${item.localizacao}\n` +
                          `Responsável: ${item.responsavel}\n` +
                          `Status: ${item.status}\n` +
                          `Data Cadastro: ${item.dataCadastro}\n` +
                          `Observações: ${item.observacoes || 'Nenhuma'}`);
                }
            });
        });
        
        // Botões comentário
        document.querySelectorAll(".comentario").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                const comentario = prompt(`Adicionar observação para "${item?.nome}":`, item?.observacoes || '');
                if (comentario !== null) {
                    item.observacoes = comentario;
                    localStorage.setItem('itens', JSON.stringify(itens));
                    
                    registrarAtividade('Observação adicionada', item.nome, 'fa-edit', 'bg-orange-100', 'text-orange-600');
                    alert("💬 Observação salva!");
                }
            });
        });
        
        // Botões defeito
        document.querySelectorAll(".defeito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                reportarDefeito(id);
            });
        });
        
        // Botões manutenção
        document.querySelectorAll(".manutencao").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                enviarParaManutencao(id);
            });
        });
        
        // Botões lixeira
        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (confirm(`🗑️ TEM CERTEZA QUE DESEJA REMOVER "${item?.nome}"?\nEsta ação não pode ser desfeita!`)) {
                    const novosItens = itens.filter(i => i.id != id);
                    localStorage.setItem('itens', JSON.stringify(novosItens));
                    
                    registrarAtividade('Item removido', item.nome, 'fa-trash', 'bg-gray-100', 'text-gray-600');
                    
                    btn.closest('tr').remove();
                    alert("✅ Item removido!");
                    carregarGrafico();
                    carregarEstatisticas();
                }
            });
        });
    }
    
    // ==================== FUNÇÕES DE DEFEITO ====================
    function reportarDefeito(itemId) {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const item = itens.find(i => i.id == itemId);
        if (!item) return;
        
        const defeito = prompt(`Descreva o defeito do item "${item.nome}":`);
        if (!defeito) return;
        
        const prioridade = prompt("Prioridade (alta/media/baixa):", "media");
        if (!prioridade || !['alta', 'media', 'baixa'].includes(prioridade)) {
            alert("Prioridade inválida! Use alta, media ou baixa.");
            return;
        }
        
        // Atualizar status do item
        item.status = 'defeito';
        item.observacoes = defeito;
        localStorage.setItem('itens', JSON.stringify(itens));
        
        // Registrar defeito
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        defeitos.push({
            id: Date.now(),
            itemId: item.id,
            item: item.nome,
            defeito: defeito,
            prioridade: prioridade,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR'),
            responsavel: item.responsavel,
            status: 'pendente',
            observacoes: defeito
        });
        localStorage.setItem('defeitos', JSON.stringify(defeitos));
        
        registrarAtividade('Item marcado como defeituoso', item.nome, 'fa-exclamation-triangle', 'bg-red-100', 'text-red-600');
        
        alert(`🔧 Defeito reportado com prioridade ${prioridade}!`);
        carregarTudo();
    }
    
    function configurarBotoesDefeito() {
        // Botões editar defeito
        document.querySelectorAll(".btn-editar-defeito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
                const item = itens.find(i => i.id == itemId);
                const defeito = defeitos.find(d => d.itemId == itemId);
                
                if (!defeito) return;
                
                const novoDefeito = prompt("Editar descrição do defeito:", defeito.defeito);
                if (novoDefeito) {
                    defeito.defeito = novoDefeito;
                    localStorage.setItem('defeitos', JSON.stringify(defeitos));
                    
                    if (item) {
                        item.observacoes = novoDefeito;
                        localStorage.setItem('itens', JSON.stringify(itens));
                    }
                    
                    alert("✅ Defeito atualizado!");
                    carregarItensDefeito();
                }
            });
        });
        
        // Botões resolver defeito
        document.querySelectorAll(".btn-resolver-defeito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
                const item = itens.find(i => i.id == itemId);
                
                if (confirm(`O defeito do item "${item?.nome}" foi resolvido?`)) {
                    // Atualizar status do item
                    item.status = 'em_uso';
                    item.observacoes = '';
                    localStorage.setItem('itens', JSON.stringify(itens));
                    
                    // Remover defeito
                    const novosDefeitos = defeitos.filter(d => d.itemId != itemId);
                    localStorage.setItem('defeitos', JSON.stringify(novosDefeitos));
                    
                    registrarAtividade('Defeito resolvido', item.nome, 'fa-check-circle', 'bg-green-100', 'text-green-600');
                    
                    alert("✅ Defeito resolvido!");
                    carregarTudo();
                }
            });
        });
        
        // Botões enviar para manutenção
        document.querySelectorAll(".btn-manutencao-defeito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                enviarParaManutencao(itemId);
            });
        });
    }
    
    // ==================== FUNÇÕES DE MANUTENÇÃO ====================
    function enviarParaManutencao(itemId) {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const item = itens.find(i => i.id == itemId);
        if (!item) return;
        
        const descricao = prompt(`Descreva o que precisa ser feito no item "${item.nome}":`, item.observacoes || '');
        if (!descricao) return;
        
        const tipo = prompt("Tipo de manutenção (preventiva/corretiva/reparo):", "reparo");
        if (!tipo) return;
        
        const diasPrevisao = prompt("Previsão de conclusão (dias):", "3");
        if (!diasPrevisao) return;
        
        const previsao = new Date(Date.now() + parseInt(diasPrevisao) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
        
        // Atualizar status do item
        item.status = 'manutencao';
        item.observacoes = descricao;
        localStorage.setItem('itens', JSON.stringify(itens));
        
        // Registrar manutenção
        const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
        manutencoes.push({
            id: Date.now(),
            itemId: item.id,
            item: item.nome,
            descricao: descricao,
            tipo: tipo,
            prioridade: 'media',
            dataInicio: new Date().toLocaleDateString('pt-BR'),
            previsao: previsao,
            responsavel: item.responsavel,
            status: 'em_andamento',
            observacoes: descricao
        });
        localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
        
        registrarAtividade('Item enviado para manutenção', item.nome, 'fa-tools', 'bg-orange-100', 'text-orange-600');
        
        alert(`🔧 Item enviado para manutenção! Previsão: ${previsao}`);
        carregarTudo();
    }
    
    function configurarBotoesManutencao() {
        // Botões concluir manutenção
        document.querySelectorAll(".btn-concluir-manutencao").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
                const item = itens.find(i => i.id == itemId);
                
                if (confirm(`Manutenção do item "${item?.nome}" foi concluída?`)) {
                    // Atualizar status do item
                    item.status = 'em_uso';
                    item.observacoes = '';
                    localStorage.setItem('itens', JSON.stringify(itens));
                    
                    // Remover manutenção
                    const novasManutencoes = manutencoes.filter(m => m.itemId != itemId);
                    localStorage.setItem('manutencoes', JSON.stringify(novasManutencoes));
                    
                    registrarAtividade('Manutenção concluída', item.nome, 'fa-check-circle', 'bg-green-100', 'text-green-600');
                    
                    alert("✅ Manutenção concluída!");
                    carregarTudo();
                }
            });
        });
        
        // Botões editar manutenção
        document.querySelectorAll(".btn-editar-manutencao").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
                const manutencao = manutencoes.find(m => m.itemId == itemId);
                
                if (!manutencao) return;
                
                const novaDescricao = prompt("Editar descrição da manutenção:", manutencao.descricao);
                if (novaDescricao) {
                    manutencao.descricao = novaDescricao;
                    localStorage.setItem('manutencoes', JSON.stringify(manutencoes));
                    alert("✅ Manutenção atualizada!");
                    carregarItensManutencao();
                }
            });
        });
        
        // Botões cancelar manutenção
        document.querySelectorAll(".btn-cancelar-manutencao").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const itemId = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
                const item = itens.find(i => i.id == itemId);
                
                if (confirm(`Cancelar manutenção do item "${item?.nome}"?`)) {
                    // Voltar status para o anterior
                    item.status = 'em_uso';
                    localStorage.setItem('itens', JSON.stringify(itens));
                    
                    // Remover manutenção
                    const novasManutencoes = manutencoes.filter(m => m.itemId != itemId);
                    localStorage.setItem('manutencoes', JSON.stringify(novasManutencoes));
                    
                    registrarAtividade('Manutenção cancelada', item.nome, 'fa-times-circle', 'bg-red-100', 'text-red-600');
                    
                    alert("❌ Manutenção cancelada!");
                    carregarTudo();
                }
            });
        });
    }
    
    // ==================== SIDEBAR ====================
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.toggle('collapsed');
        
        const chevron = document.querySelector('.fa-chevron-left, .fa-chevron-right');
        if (chevron) {
            if (sidebar?.classList.contains('collapsed')) {
                chevron.classList.remove('fa-chevron-left');
                chevron.classList.add('fa-chevron-right');
            } else {
                chevron.classList.remove('fa-chevron-right');
                chevron.classList.add('fa-chevron-left');
            }
        }
    };
});
