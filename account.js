// account.js - VERSÃO ESTÁVEL E ROBUSTA

document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");

    carregarDadosDoBackend();

    // ==================== FETCH SEGURO ====================
    async function fetchSeguro(url, options = {}) {
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
        } finally {
            clearTimeout(timeoutId);
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
                console.error('Erro backend:', result?.error);
                carregarDadosLocalStorage();
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            carregarDadosLocalStorage();
        } finally {
            mostrarLoading(false);
        }
    }

    function carregarTudo(data) {
        carregarTabelaItens();
        carregarItensDefeito();
        carregarItensManutencao();
        carregarGrafico();
        carregarAtividadesRecentes(data.historico);
        carregarEstatisticas(data.estatisticas);
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

    function carregarDadosLocalStorage() {
        console.log('⚠️ Usando fallback localStorage');

        carregarTabelaItens();
        carregarItensDefeito();
        carregarItensManutencao();
        carregarGrafico();
        carregarAtividadesRecentes();
        carregarEstatisticas();
    }

    // ==================== ADICIONAR ITEM ====================
    document.getElementById("btnAdicionarItem")?.addEventListener("click", async () => {
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
                alert("✅ Item adicionado com sucesso!");
                await carregarDadosDoBackend();
            } else {
                throw new Error(result?.error || "Erro desconhecido");
            }
        } catch (error) {
            console.error("Erro ao adicionar:", error);

            if (error.name === 'AbortError') {
                alert("⏱️ Servidor demorou para responder.");
            } else {
                alert("❌ Falha ao adicionar item.");
            }
        } finally {
            mostrarLoading(false);
        }
    });

    // ==================== TABELA ====================
    function carregarTabelaItens() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;

        const itens = JSON.parse(localStorage.getItem('itens') || '[]');

        tbody.innerHTML = '';

        itens
            .sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
            .forEach(item => {
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
<button class="visual text-blue-600 mr-2" data-id="${item.id}"><i class="fas fa-eye"></i></button>
<button class="defeito text-red-600 mr-2" data-id="${item.id}"><i class="fas fa-exclamation-triangle"></i></button>
<button class="manutencao text-purple-600 mr-2" data-id="${item.id}"><i class="fas fa-tools"></i></button>
<button class="lixeira text-gray-600" data-id="${item.id}"><i class="fas fa-trash"></i></button>
</td>
`;

                tbody.appendChild(tr);
            });

        configurarBotoesTabela();
    }

    // ==================== SIDEBAR ====================
    window.toggleSidebar = function () {
        document.querySelector('.sidebar')?.classList.toggle('collapsed');
    };
});