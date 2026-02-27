// account.js - VERSÃO CONECTADA COM O BACKEND
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");
    
    // ==================== CARREGAR DADOS DO BACKEND ====================
    carregarDadosDoBackend();
    
    async function carregarDadosDoBackend() {
        try {
            // Mostrar loading
            mostrarLoading(true);
            
            // Buscar dashboard completo
            const response = await fetch('/api/dashboard');
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Dados carregados do backend:', result.data);
                
                // Salvar no localStorage como cache
                localStorage.setItem('itens', JSON.stringify(result.data.itens));
                localStorage.setItem('defeitos', JSON.stringify(result.data.defeitos));
                localStorage.setItem('manutencoes', JSON.stringify(result.data.manutencoes));
                localStorage.setItem('comentarios', JSON.stringify(result.data.comentarios));
                
                // Carregar a interface
                carregarTabelaItens();
                carregarItensDefeito();
                carregarItensManutencao();
                carregarGrafico();
                carregarAtividadesRecentes(result.data.historico);
                carregarEstatisticas(result.data.estatisticas);
            } else {
                console.error('Erro ao carregar dados:', result.error);
                // Fallback para localStorage
                carregarDadosLocalStorage();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            // Fallback para localStorage
            carregarDadosLocalStorage();
        } finally {
            mostrarLoading(false);
        }
    }
    
    function mostrarLoading(mostrar) {
        let loading = document.getElementById('loading');
        if (mostrar) {
            if (!loading) {
                loading = document.createElement('div');
                loading.id = 'loading';
                loading.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
                loading.innerHTML = '<div class="bg-white p-4 rounded-lg"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Carregando...</p></div>';
                document.body.appendChild(loading);
            }
        } else if (loading) {
            loading.remove();
        }
    }
    
    function carregarDadosLocalStorage() {
        console.log('⚠️ Usando dados do localStorage (fallback)');
        carregarTabelaItens();
        carregarItensDefeito();
        carregarItensManutencao();
        carregarGrafico();
        carregarAtividadesRecentes();
        carregarEstatisticas();
    }
    
    // ==================== GRÁFICO ====================
    function carregarGrafico() {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const emUso = itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = itens.filter(i => i.status === 'defeito').length;
        const manutencao = itens.filter(i => i.status === 'manutencao').length;
        
        if (window.meuGrafico) window.meuGrafico.destroy();
        
        window.meuGrafico = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Em Uso', 'Com Defeito', 'Em Manutenção'],
                datasets: [{
                    data: [emUso || 856, comDefeito || 142, manutencao || 250],
                    backgroundColor: ['#10B981', '#EF4444', '#F97316'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '70%'
            }
        });
    }
    
    // ==================== ESTATÍSTICAS ====================
    function carregarEstatisticas(estatisticas = null) {
        const itens = estatisticas || JSON.parse(localStorage.getItem('itens') || '[]');
        const total = estatisticas ? estatisticas.total : itens.length;
        const emUso = estatisticas ? estatisticas.emUso : itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = estatisticas ? estatisticas.comDefeito : itens.filter(i => i.status === 'defeito').length;
        const emManutencao = estatisticas ? estatisticas.emManutencao : itens.filter(i => i.status === 'manutencao').length;
        
        const statsContainer = document.querySelector('.grid-cols-1.md\\:grid-cols-4');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="bg-white rounded-xl shadow-sm p-4">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-full mr-4">
                            <i class="fas fa-boxes text-blue-800 text-xl"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Total de Itens</p>
                            <p class="text-2xl font-bold">${total}</p>
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
                            <p class="text-2xl font-bold">${emUso}</p>
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
                            <p class="text-2xl font-bold">${comDefeito}</p>
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
                            <p class="text-2xl font-bold">${emManutencao}</p>
                        </div>
                    </div>
                </div>
            `;
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
    
    // ==================== BOTÃO ADICIONAR ITEM ====================
    document.getElementById("btnAdicionarItem")?.addEventListener("click", async () => {
        const nome = prompt("Nome do item:");
        if (!nome) return;
        
        const categoria = prompt("Categoria:");
        if (!categoria) return;
        
        const localizacao = prompt("Localização:");
        if (!localizacao) return;
        
        const responsavel = prompt("Responsável:");
        if (!responsavel) return;
        
        const patrimonio = prompt("Número de Patrimônio (opcional):");
        
        const novoItem = {
            nome,
            categoria,
            localizacao,
            responsavel,
            patrimonio: patrimonio || `PAT-${String(Date.now()).slice(-3)}`,
            status: 'em_uso',
            observacoes: ''
        };
        
        try {
            mostrarLoading(true);
            
            // Enviar para o backend
            const response = await fetch('/api/itens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert("✅ Item adicionado com sucesso!");
                carregarDadosDoBackend(); // Recarregar tudo
            } else {
                alert("❌ Erro ao adicionar item: " + result.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert("❌ Erro de conexão com o servidor");
        } finally {
            mostrarLoading(false);
        }
    });
    
    // ==================== CONFIGURAR BOTÕES ====================
    function configurarBotoesTabela() {
        // Visualizar
        document.querySelectorAll(".visual").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                
                try {
                    const response = await fetch(`/api/itens/${id}`);
                    const result = await response.json();
                    
                    if (result.success) {
                        const item = result.data;
                        alert(`📋 DETALHES DO ITEM\n\n` +
                              `ID: ${item.patrimonio}\n` +
                              `Nome: ${item.nome}\n` +
                              `Categoria: ${item.categoria}\n` +
                              `Localização: ${item.localizacao}\n` +
                              `Responsável: ${item.responsavel}\n` +
                              `Status: ${item.status}\n` +
                              `Data: ${item.dataCadastro}\n` +
                              `Obs: ${item.observacoes || 'Nenhuma'}`);
                    }
                } catch (error) {
                    console.error('Erro:', error);
                }
            });
        });
        
        // Reportar Defeito
        document.querySelectorAll(".defeito").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                
                const defeito = prompt("Descreva o defeito:");
                if (!defeito) return;
                
                const prioridade = prompt("Prioridade (alta/media/baixa):", "media");
                
                try {
                    mostrarLoading(true);
                    
                    const response = await fetch('/api/defeitos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            itemId: parseInt(id),
                            item: btn.closest('tr').querySelector('td:nth-child(2)').textContent,
                            defeito,
                            prioridade,
                            responsavel: btn.closest('tr').querySelector('td:nth-child(5)').textContent
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert("✅ Defeito registrado!");
                        carregarDadosDoBackend();
                    }
                } catch (error) {
                    console.error('Erro:', error);
                } finally {
                    mostrarLoading(false);
                }
            });
        });
        
        // Enviar para Manutenção
        document.querySelectorAll(".manutencao").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                
                const descricao = prompt("Descreva o serviço necessário:");
                if (!descricao) return;
                
                const dias = prompt("Previsão em dias:", "3");
                
                const previsao = new Date(Date.now() + parseInt(dias) * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
                
                try {
                    mostrarLoading(true);
                    
                    const response = await fetch('/api/manutencoes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            itemId: parseInt(id),
                            item: btn.closest('tr').querySelector('td:nth-child(2)').textContent,
                            descricao,
                            previsao,
                            responsavel: btn.closest('tr').querySelector('td:nth-child(5)').textContent,
                            tipo: 'reparo',
                            prioridade: 'media'
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert("✅ Item enviado para manutenção!");
                        carregarDadosDoBackend();
                    }
                } catch (error) {
                    console.error('Erro:', error);
                } finally {
                    mostrarLoading(false);
                }
            });
        });
        
        // Remover Item
        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const nome = btn.closest('tr').querySelector('td:nth-child(2)').textContent;
                
                if (confirm(`🗑️ Remover "${nome}"?`)) {
                    try {
                        mostrarLoading(true);
                        
                        const response = await fetch(`/api/itens/${id}`, {
                            method: 'DELETE'
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            alert("✅ Item removido!");
                            carregarDadosDoBackend();
                        }
                    } catch (error) {
                        console.error('Erro:', error);
                    } finally {
                        mostrarLoading(false);
                    }
                }
            });
        });
    }
    
    // ==================== ATIVIDADES RECENTES ====================
    function carregarAtividadesRecentes(historico = null) {
        const container = document.querySelector('.lg\\:col-span-2 + div .space-y-4');
        if (!container) return;
        
        const atividades = historico || JSON.parse(localStorage.getItem('historico') || '[]');
        const recentes = atividades.slice(-5).reverse();
        
        container.innerHTML = '';
        
        if (recentes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Nenhuma atividade recente</p>';
        } else {
            recentes.forEach(ativ => {
                const div = document.createElement('div');
                div.className = 'flex items-start hover:bg-gray-50 p-2 rounded-lg transition-colors';
                div.innerHTML = `
                    <div class="p-2 bg-blue-100 rounded-lg text-blue-800 mr-3">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium">${ativ.acao}</p>
                        <p class="text-xs text-gray-500">${ativ.item} - ${ativ.data} ${ativ.hora}</p>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    }
    
    // ==================== ITENS COM DEFEITO ====================
    function carregarItensDefeito() {
        const container = document.querySelector('#defective-items .space-y-4');
        if (!container) return;
        
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        
        container.innerHTML = '';
        
        if (defeitos.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Nenhum item com defeito</p>';
            return;
        }
        
        defeitos.sort((a, b) => a.prioridade === 'alta' ? -1 : 1).forEach(defeito => {
            const div = document.createElement('div');
            div.className = `p-3 rounded-lg ${
                defeito.prioridade === 'alta' ? 'bg-red-100' :
                defeito.prioridade === 'media' ? 'bg-orange-50' : 'bg-yellow-50'
            }`;
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-medium">${defeito.item}</p>
                        <p class="text-sm">${defeito.defeito}</p>
                        <p class="text-xs text-gray-500 mt-1">${defeito.data} - ${defeito.responsavel}</p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full ${
                        defeito.prioridade === 'alta' ? 'bg-red-200 text-red-800' :
                        defeito.prioridade === 'media' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                    }">
                        ${defeito.prioridade}
                    </span>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    // ==================== ITENS EM MANUTENÇÃO ====================
    function carregarItensManutencao() {
        const container = document.querySelector('#maintenance-items .space-y-4');
        if (!container) return;
        
        const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
        
        container.innerHTML = '';
        
        if (manutencoes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Nenhum item em manutenção</p>';
            return;
        }
        
        manutencoes.forEach(manutencao => {
            const div = document.createElement('div');
            div.className = 'p-3 bg-orange-50 rounded-lg';
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <p class="font-medium">${manutencao.item}</p>
                        <p class="text-sm">${manutencao.descricao}</p>
                        <p class="text-xs text-gray-500 mt-1">
                            Previsão: ${manutencao.previsao} - ${manutencao.responsavel}
                        </p>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-full bg-orange-200 text-orange-800">
                        ${manutencao.status}
                    </span>
                </div>
            `;
            container.appendChild(div);
        });
    }
    
    // ==================== SIDEBAR ====================
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.toggle('collapsed');
    };
});
