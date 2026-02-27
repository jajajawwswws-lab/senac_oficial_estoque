// account.js — VERSÃO COMPLETA FUNCIONAL E ESTÁVEL

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");

    // ==================== FETCH SEGURO COM RETRY ====================
    async function fetchSeguro(url, options = {}, tentativas = 2) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            if (!response.ok) {
                const texto = await response.text().catch(() => "");
                throw new Error(`HTTP ${response.status} ${texto}`);
            }

            return await response.json();

        } catch (error) {
            if (tentativas > 0 && error.name !== "AbortError") {
                console.warn("🔁 Retry fetch...", tentativas);
                return fetchSeguro(url, options, tentativas - 1);
            }
            throw error;

        } finally {
            clearTimeout(timeoutId);
        }
    }

    // ==================== LOADING ====================
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
        } else {
            loading?.remove();
        }
    }

    // ==================== CARREGAR DADOS ====================
    async function carregarDadosDoBackend() {
        try {
            mostrarLoading(true);

            const result = await fetchSeguro('/api/dashboard');

            if (result?.success) {
                const data = result.data || {};

                localStorage.setItem('itens', JSON.stringify(data.itens || []));
                localStorage.setItem('defeitos', JSON.stringify(data.defeitos || []));
                localStorage.setItem('manutencoes', JSON.stringify(data.manutencoes || []));
                localStorage.setItem('comentarios', JSON.stringify(data.comentarios || []));
                localStorage.setItem('historico', JSON.stringify(data.historico || []));

                carregarTudo(data);
            } else {
                carregarDadosLocalStorage();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            carregarDadosLocalStorage();
        } finally {
            mostrarLoading(false);
        }
    }

    function carregarDadosLocalStorage() {
        console.log('⚠️ Usando fallback localStorage');
        carregarTudo({});
    }

    function carregarTudo(data) {
        carregarTabelaItens();
        carregarItensDefeito();
        carregarItensManutencao();
        carregarGrafico();
        carregarAtividadesRecentes(data?.historico);
        carregarEstatisticas(data?.estatisticas);
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
                    data: [emUso, comDefeito, manutencao],
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
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');

        const total = estatisticas?.total ?? itens.length;
        const emUso = estatisticas?.emUso ?? itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = estatisticas?.comDefeito ?? itens.filter(i => i.status === 'defeito').length;
        const emManutencao = estatisticas?.emManutencao ?? itens.filter(i => i.status === 'manutencao').length;

        const statsContainer = document.querySelector('.grid-cols-1.md\\:grid-cols-4');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
<div class="bg-white rounded-xl shadow-sm p-4">
<p class="text-sm text-gray-500">Total de Itens</p>
<p class="text-2xl font-bold">${total}</p>
</div>
<div class="bg-white rounded-xl shadow-sm p-4">
<p class="text-sm text-gray-500">Em Uso</p>
<p class="text-2xl font-bold">${emUso}</p>
</div>
<div class="bg-white rounded-xl shadow-sm p-4">
<p class="text-sm text-gray-500">Com Defeito</p>
<p class="text-2xl font-bold">${comDefeito}</p>
</div>
<div class="bg-white rounded-xl shadow-sm p-4">
<p class="text-sm text-gray-500">Em Manutenção</p>
<p class="text-2xl font-bold">${emManutencao}</p>
</div>
`;
    }

    // ==================== RENDER TABELA ====================
    function renderTabela(lista) {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        lista.forEach(item => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
<td class="px-6 py-4 text-sm font-medium">${item.patrimonio || ''}</td>
<td class="px-6 py-4 text-sm">${item.nome || ''}</td>
<td class="px-6 py-4 text-sm">${item.categoria || ''}</td>
<td class="px-6 py-4 text-sm">${item.localizacao || ''}</td>
<td class="px-6 py-4 text-sm">${item.responsavel || ''}</td>
<td class="px-6 py-4 text-sm">${item.status || ''}</td>
<td class="px-6 py-4 text-sm">
<button class="comentario text-orange-600 mr-2" data-id="${item.id}">
<i class="fas fa-edit"></i>
</button>
<button class="lixeira text-gray-600" data-id="${item.id}">
<i class="fas fa-trash"></i>
</button>
</td>
`;

            tbody.appendChild(tr);
        });

        configurarBotoesTabela();
    }

    function carregarTabelaItens() {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        renderTabela(itens);
    }

    // ==================== BUSCA ====================
    const inputBusca = document.getElementById("buscarItem");
    inputBusca?.addEventListener("input", () => {
        const termo = inputBusca.value.toLowerCase().trim();
        filtrarTabela(termo);
    });

    function filtrarTabela(termo = "") {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');

        const filtrados = itens.filter(item =>
            item.nome?.toLowerCase().includes(termo) ||
            item.categoria?.toLowerCase().includes(termo) ||
            item.localizacao?.toLowerCase().includes(termo) ||
            item.responsavel?.toLowerCase().includes(termo)
        );

        renderTabela(filtrados);
    }

    // ==================== ADICIONAR ITEM ====================
    const btnAdd = document.getElementById("btnAdicionarItem");

    btnAdd?.addEventListener("click", async () => {
        if (btnAdd.disabled) return;
        btnAdd.disabled = true;

        try {
            const nome = prompt("Nome do item:")?.trim();
            if (!nome) return;

            const categoria = prompt("Categoria:")?.trim();
            if (!categoria) return;

            const localizacao = prompt("Localização:")?.trim();
            if (!localizacao) return;

            const responsavel = prompt("Responsável:")?.trim();
            if (!responsavel) return;

            const patrimonioInput = prompt("Número de Patrimônio (opcional):");

            const novoItem = {
                nome,
                categoria,
                localizacao,
                responsavel,
                patrimonio:
                    patrimonioInput?.trim() ||
                    `PAT-${Date.now().toString().slice(-6)}`,
                status: 'em_uso',
                observacoes: ''
            };

            mostrarLoading(true);

            const result = await fetchSeguro('/api/itens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem)
            });

            if (result?.success) {
                alert("✅ Item adicionado!");
                await carregarDadosDoBackend();
            } else {
                throw new Error(result?.error);
            }

        } catch (error) {
            console.error(error);
            alert("❌ Falha ao adicionar item");
        } finally {
            mostrarLoading(false);
            btnAdd.disabled = false;
        }
    });

    // ==================== BOTÕES DA TABELA ====================
    function configurarBotoesTabela() {
        document.querySelectorAll(".comentario").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const texto = prompt("Digite o comentário:");
                if (!texto?.trim()) return;

                try {
                    mostrarLoading(true);

                    const result = await fetchSeguro('/api/comentarios', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            itemId: Number(id),
                            texto: texto.trim()
                        })
                    });

                    if (result.success) {
                        alert("✅ Comentário adicionado!");
                        carregarDadosDoBackend();
                    }

                } catch (err) {
                    console.error(err);
                    alert("❌ Erro ao comentar");
                } finally {
                    mostrarLoading(false);
                }
            };
        });

        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                if (!confirm("Remover item?")) return;

                try {
                    mostrarLoading(true);

                    const result = await fetchSeguro(`/api/itens/${id}`, {
                        method: 'DELETE'
                    });

                    if (result.success) {
                        alert("✅ Item removido!");
                        carregarDadosDoBackend();
                    }

                } catch (err) {
                    console.error(err);
                    alert("❌ Erro ao remover");
                } finally {
                    mostrarLoading(false);
                }
            };
        });
    }

    // ==================== INICIAR ====================
    carregarDadosDoBackend();

    // ==================== SIDEBAR ====================
    window.toggleSidebar = function () {
        document.querySelector('.sidebar')?.classList.toggle('collapsed');
    };
});