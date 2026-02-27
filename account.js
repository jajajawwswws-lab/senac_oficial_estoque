// account.js - VERSÃO CONECTADA COM O BACKEND (CORRIGIDA E ROBUSTA)

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");

    // ==================== CARREGAR DADOS DO BACKEND ====================
    carregarDadosDoBackend();

    async function carregarDadosDoBackend() {
        try {
            mostrarLoading(true);

            const response = await fetch('/api/dashboard', {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            let result;
            try {
                result = await response.json();
            } catch {
                throw new Error('Resposta inválida do servidor');
            }

            if (result.success) {
                console.log('✅ Dados carregados do backend:', result.data);

                localStorage.setItem('itens', JSON.stringify(result.data.itens || []));
                localStorage.setItem('defeitos', JSON.stringify(result.data.defeitos || []));
                localStorage.setItem('manutencoes', JSON.stringify(result.data.manutencoes || []));
                localStorage.setItem('comentarios', JSON.stringify(result.data.comentarios || []));
                localStorage.setItem('historico', JSON.stringify(result.data.historico || []));

                carregarTabelaItens();
                carregarItensDefeito();
                carregarItensManutencao();
                carregarGrafico();
                carregarAtividadesRecentes(result.data.historico);
                carregarEstatisticas(result.data.estatisticas);
            } else {
                console.error('Erro ao carregar dados:', result.error);
                carregarDadosLocalStorage();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
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
                loading.className =
                    'fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50';
                loading.innerHTML =
                    '<div class="bg-white p-4 rounded-lg"><i class="fas fa-spinner fa-spin text-2xl"></i><p class="mt-2">Carregando...</p></div>';
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
                    data: [emUso || 0, comDefeito || 0, manutencao || 0],
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
        const emManutencao = estatisticas
            ? estatisticas.emManutencao
            : itens.filter(i => i.status === 'manutencao').length;

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

        itens.sort((a, b) => (a.id || 0) - (b.id || 0)).forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${item.patrimonio || `#ITM-${String(item.id || 0).padStart(3, '0')}`}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.nome || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.categoria || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.localizacao || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.responsavel || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 py-1 text-xs rounded-full ${
                        item.status === 'em_uso'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'defeito'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                    }">
                        ${
                            item.status === 'em_uso'
                                ? 'Em Uso'
                                : item.status === 'defeito'
                                ? 'Com Defeito'
                                : 'Em Manutenção'
                        }
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button class="visual text-blue-600 hover:text-blue-900 mr-2" data-id="${item.id}" title="Visualizar"><i class="fas fa-eye"></i></button>
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
        try {
            const nome = prompt("Nome do item:")?.trim();
            if (!nome) return alert("❌ Nome obrigatório");

            const categoria = prompt("Categoria:")?.trim();
            if (!categoria) return alert("❌ Categoria obrigatória");

            const localizacao = prompt("Localização:")?.trim();
            if (!localizacao) return alert("❌ Localização obrigatória");

            const responsavel = prompt("Responsável:")?.trim();
            if (!responsavel) return alert("❌ Responsável obrigatório");

            const patrimonioInput = prompt("Número de Patrimônio (opcional):");

            const novoItem = {
                nome,
                categoria,
                localizacao,
                responsavel,
                patrimonio: patrimonioInput?.trim() || `PAT-${Date.now().toString().slice(-6)}`,
                status: 'em_uso',
                observacoes: ''
            };

            mostrarLoading(true);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch('/api/itens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(novoItem),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Falha ao salvar');
            }

            alert("✅ Item adicionado com sucesso!");
            await carregarDadosDoBackend();
        } catch (error) {
            console.error('Erro ao adicionar item:', error);

            if (error.name === 'AbortError') {
                alert("⏱️ Servidor demorou para responder.");
            } else if (error.message?.includes('Failed to fetch')) {
                alert("🌐 Não foi possível conectar ao servidor.");
            } else {
                alert("❌ " + error.message);
            }
        } finally {
            mostrarLoading(false);
        }
    });

    // ==================== CONFIGURAR BOTÕES ====================
    function configurarBotoesTabela() {
        // Visualizar
        document.querySelectorAll(".visual").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.preventDefault();
                const id = btn.dataset.id;

                try {
                    const response = await fetch(`/api/itens/${id}`);
                    if (!response.ok) throw new Error('Falha ao buscar item');

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

        // Remover Item
        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.addEventListener("click", async e => {
                e.preventDefault();
                const id = btn.dataset.id;
                const nome = btn.closest('tr').querySelector('td:nth-child(2)').textContent;

                if (!confirm(`🗑️ Remover "${nome}"?`)) return;

                try {
                    mostrarLoading(true);

                    const response = await fetch(`/api/itens/${id}`, {
                        method: 'DELETE'
                    });

                    if (!response.ok) throw new Error('Falha ao remover');

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
            return;
        }

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

    // ==================== SIDEBAR ====================
    window.toggleSidebar = function () {
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.toggle('collapsed');
    };
});