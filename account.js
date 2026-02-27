// ==================== BOTÃO ADICIONAR ITEM ====================
document.getElementById("btnAdicionarItem")?.addEventListener("click", async () => {
    try {
        // ==================== COLETA DE DADOS ====================
        const nome = prompt("Nome do item:");
        if (!nome || !nome.trim()) {
            alert("❌ Nome é obrigatório.");
            return;
        }

        const categoria = prompt("Categoria:");
        if (!categoria || !categoria.trim()) {
            alert("❌ Categoria é obrigatória.");
            return;
        }

        const localizacao = prompt("Localização:");
        if (!localizacao || !localizacao.trim()) {
            alert("❌ Localização é obrigatória.");
            return;
        }

        const responsavel = prompt("Responsável:");
        if (!responsavel || !responsavel.trim()) {
            alert("❌ Responsável é obrigatório.");
            return;
        }

        const patrimonioInput = prompt("Número de Patrimônio (opcional):");

        // ==================== OBJETO ====================
        const novoItem = {
            nome: nome.trim(),
            categoria: categoria.trim(),
            localizacao: localizacao.trim(),
            responsavel: responsavel.trim(),
            patrimonio: patrimonioInput?.trim() || `PAT-${Date.now().toString().slice(-6)}`,
            status: 'em_uso',
            observacoes: ''
        };

        mostrarLoading(true);

        // ==================== TIMEOUT ====================
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        // ==================== REQUEST ====================
        const response = await fetch('/api/itens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(novoItem),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // ==================== VERIFICA HTTP ====================
        if (!response.ok) {
            let erroTexto = '';
            try {
                erroTexto = await response.text();
            } catch {
                erroTexto = 'Sem detalhes';
            }
            throw new Error(`HTTP ${response.status} - ${erroTexto}`);
        }

        // ==================== PARSE JSON SEGURO ====================
        let result;
        try {
            result = await response.json();
        } catch {
            throw new Error('Resposta do servidor não é JSON válido');
        }

        // ==================== RESULTADO ====================
        if (result.success) {
            alert("✅ Item adicionado com sucesso!");
            await carregarDadosDoBackend();
        } else {
            throw new Error(result.error || "Erro retornado pelo servidor");
        }

    } catch (error) {
        console.error("❌ Erro ao adicionar item:", error);

        if (error.name === 'AbortError') {
            alert("⏱️ O servidor demorou muito para responder.");
        } else if (error.message?.includes('Failed to fetch')) {
            alert("🌐 Não foi possível conectar ao servidor.");
        } else {
            alert("❌ Falha ao adicionar item: " + error.message);
        }

    } finally {
        mostrarLoading(false);
    }
});