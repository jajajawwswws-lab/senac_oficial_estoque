document.addEventListener("DOMContentLoaded", () => {
    // ==================== INICIALIZAÇÃO ====================
    carregarItens();
    carregarDefeitos();
    carregarManutencoes();
    carregarComentarios();
    
    // ==================== GRÁFICO ====================
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        // Buscar dados do localStorage
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const emUso = itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = itens.filter(i => i.status === 'defeito').length;
        const emManutencao = itens.filter(i => i.status === 'manutencao').length;
        
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Em Uso', 'Com Defeito', 'Em Manutenção'],
                datasets: [{
                    data: [emUso || 856, comDefeito || 142, emManutencao || 250],
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

    // ==================== ADICIONAR ITEM ====================
    const btnAdd = document.getElementById("btnAdicionarItem");
    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            const nome = prompt("Nome do item:");
            if (!nome) return;
            
            const categoria = prompt("Categoria:");
            if (!categoria) return;
            
            const localizacao = prompt("Localização:");
            if (!localizacao) return;
            
            const responsavel = prompt("Responsável:");
            if (!responsavel) return;
            
            const novoItem = {
                id: Date.now(),
                nome: nome,
                categoria: categoria,
                localizacao: localizacao,
                responsavel: responsavel,
                status: 'em_uso',
                dataCadastro: new Date().toLocaleDateString('pt-BR')
            };
            
            // Salvar no localStorage
            const itens = JSON.parse(localStorage.getItem('itens') || '[]');
            itens.push(novoItem);
            localStorage.setItem('itens', JSON.stringify(itens));
            
            alert("✅ Item adicionado com sucesso!");
            window.location.reload(); // Recarregar para mostrar o item
        });
    }

    // ==================== BOTÕES DE DEFEITO ====================
    document.querySelectorAll(".btndefeito").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const container = event.currentTarget.closest('.flex');
            if (!container) return;
            
            const itemElement = container.querySelector('.item_dft, .font-medium');
            const descricaoElement = container.querySelector('.description_dft');
            
            if (!itemElement || !descricaoElement) return;
            
            const item = itemElement.textContent;
            const defeitoAtual = descricaoElement.textContent;
            
            const novoDefeito = prompt(`Descreva o defeito do item "${item}":`, defeitoAtual);
            
            if (novoDefeito && novoDefeito.trim() !== "") {
                // Atualizar na tela
                descricaoElement.textContent = novoDefeito;
                
                // Salvar no localStorage
                const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
                defeitos.push({
                    id: Date.now(),
                    item: item,
                    defeito: novoDefeito,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                });
                localStorage.setItem('defeitos', JSON.stringify(defeitos));
                
                // Atualizar status do item
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const itemIndex = itens.findIndex(i => i.nome === item);
                if (itemIndex !== -1) {
                    itens[itemIndex].status = 'defeito';
                    localStorage.setItem('itens', JSON.stringify(itens));
                }
                
                alert(`✅ Defeito registrado: ${novoDefeito}`);
            }
        });
    });

    // ==================== BOTÕES DE MANUTENÇÃO ====================
    // Botões positivos (consertado)
    document.querySelectorAll(".positive").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const container = event.currentTarget.closest('.flex');
            if (!container) return;
            
            const itemElement = container.querySelector('.font-medium');
            if (!itemElement) return;
            
            const item = itemElement.textContent;
            
            if (confirm(`O item "${item}" foi consertado?`)) {
                // Atualizar no localStorage
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const itemIndex = itens.findIndex(i => i.nome === item);
                if (itemIndex !== -1) {
                    itens[itemIndex].status = 'em_uso';
                    localStorage.setItem('itens', JSON.stringify(itens));
                }
                
                // Remover da lista de manutenção
                container.remove();
                
                alert(`✅ Item "${item}" foi recuperado com sucesso!`);
            }
        });
    });

    // Botões negativos (não consertado)
    document.querySelectorAll(".negative").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const container = event.currentTarget.closest('.flex');
            if (!container) return;
            
            const itemElement = container.querySelector('.font-medium');
            if (!itemElement) return;
            
            const item = itemElement.textContent;
            
            const opcao = confirm(
                `Item "${item}" ainda com defeito.\n` +
                `OK = Descartar\n` +
                `Cancelar = Tentar recuperar novamente`
            );
            
            if (opcao) {
                // Descartar item
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const novosItens = itens.filter(i => i.nome !== item);
                localStorage.setItem('itens', JSON.stringify(novosItens));
                
                container.remove();
                alert(`❌ Item "${item}" foi descartado.`);
            } else {
                alert(`🔄 Item "${item}" continuará em manutenção.`);
            }
        });
    });

    // ==================== BOTÕES VISUALIZAR ====================
    document.querySelectorAll(".visual").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const row = event.currentTarget.closest('tr');
            if (!row) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;
            
            const item = {
                id: cells[0]?.textContent || 'N/A',
                nome: cells[1]?.textContent || 'N/A',
                categoria: cells[2]?.textContent || 'N/A',
                localizacao: cells[3]?.textContent || 'N/A',
                responsavel: cells[4]?.textContent || 'N/A'
            };
            
            const motivo = prompt(
                `Visualizando item:\n` +
                `ID: ${item.id}\n` +
                `Nome: ${item.nome}\n` +
                `Categoria: ${item.categoria}\n` +
                `Local: ${item.localizacao}\n` +
                `Responsável: ${item.responsavel}\n\n` +
                `Por que você está visualizando este item?`
            );
            
            if (motivo) {
                const visualizacoes = JSON.parse(localStorage.getItem('visualizacoes') || '[]');
                visualizacoes.push({
                    id: Date.now(),
                    item: item.nome,
                    motivo: motivo,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                });
                localStorage.setItem('visualizacoes', JSON.stringify(visualizacoes));
                console.log(`👁️ Visualizado: ${item.nome} - Motivo: ${motivo}`);
            }
        });
    });

    // ==================== BOTÕES COMENTÁRIO ====================
    document.querySelectorAll(".comentario").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const row = event.currentTarget.closest('tr');
            if (!row) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;
            
            const item = cells[1]?.textContent || 'N/A';
            
            const comentario = prompt(`Adicionar comentário para o item "${item}":`);
            
            if (comentario && comentario.trim() !== "") {
                // Salvar comentário
                const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
                comentarios.push({
                    id: Date.now(),
                    item: item,
                    comentario: comentario,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                });
                localStorage.setItem('comentarios', JSON.stringify(comentarios));
                
                alert(`💬 Comentário adicionado: "${comentario}"`);
                console.log(`💬 Item: ${item} - Comentário: ${comentario}`);
            }
        });
    });

    // ==================== BOTÕES LIXEIRA ====================
    document.querySelectorAll(".lixeira").forEach(btn => {
        btn.addEventListener("click", (event) => {
            const row = event.currentTarget.closest('tr');
            if (!row) return;
            
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;
            
            const item = cells[1]?.textContent || 'N/A';
            const id = cells[0]?.textContent || 'N/A';
            
            if (confirm(`Tem certeza que deseja remover o item "${item}" (${id})?`)) {
                // Remover do localStorage
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const novosItens = itens.filter(i => i.nome !== item && i.id !== id);
                localStorage.setItem('itens', JSON.stringify(novosItens));
                
                // Remover da tela
                row.remove();
                
                // Registrar remoção
                const remocoes = JSON.parse(localStorage.getItem('remocoes') || '[]');
                remocoes.push({
                    id: Date.now(),
                    item: item,
                    data: new Date().toLocaleDateString('pt-BR'),
                    hora: new Date().toLocaleTimeString('pt-BR')
                });
                localStorage.setItem('remocoes', JSON.stringify(remocoes));
                
                alert(`✅ Item "${item}" removido com sucesso!`);
            }
        });
    });

    // ==================== FUNÇÕES AUXILIARES ====================
    function carregarItens() {
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        console.log('📦 Itens carregados:', itens);
    }
    
    function carregarDefeitos() {
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        console.log('🔧 Defeitos carregados:', defeitos);
    }
    
    function carregarManutencoes() {
        const manutencoes = JSON.parse(localStorage.getItem('manutencoes') || '[]');
        console.log('🔨 Manutenções carregadas:', manutencoes);
    }
    
    function carregarComentarios() {
        const comentarios = JSON.parse(localStorage.getItem('comentarios') || '[]');
        console.log('💬 Comentários carregados:', comentarios);
    }
});

// ==================== FUNÇÕES GLOBAIS ====================
function removerDefeito(id) {
    if (confirm('Remover este defeito?')) {
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        const novosDefeitos = defeitos.filter(d => d.id !== id);
        localStorage.setItem('defeitos', JSON.stringify(novosDefeitos));
        
        const lista = document.getElementById('item_dft');
        if (lista) {
            const item = document.querySelector(`[onclick="removerDefeito(${id})"]`)?.closest('li');
            if (item) item.remove();
        }
        
        alert('✅ Defeito removido!');
    }
}

function salvar_defeito(produto, descricao) {
    const defeitos = JSON.parse(localStorage.getItem('defeitos')) || [];
    defeitos.push({
        id: Date.now(),
        produto: produto,
        descricao: descricao,
        data: new Date().toLocaleDateString('pt-BR'),
        hora: new Date().toLocaleTimeString('pt-BR')
    });
    localStorage.setItem('defeitos', JSON.stringify(defeitos));
    console.log('✅ Defeito salvo:', produto, descricao);
}

function atualizar_pag() {
    const lista = document.getElementById('item_dft');
    if (!lista) return;
    
    const defeitos = JSON.parse(localStorage.getItem('defeitos')) || [];
    lista.innerHTML = '';
    
    defeitos.forEach(defeito => {
        const li = document.createElement('li');
        li.className = 'p-2 bg-red-50 rounded-lg mb-2 flex justify-between items-center';
        li.innerHTML = `
            <div>
                <strong>${defeito.produto || 'Item'}</strong>: ${defeito.descricao || 'Sem descrição'}
                <br><small class="text-gray-500">${defeito.data || ''} às ${defeito.hora || ''}</small>
            </div>
            <button onclick="removerDefeito(${defeito.id})" 
                    class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
            </button>
        `;
        lista.appendChild(li);
    });
}
