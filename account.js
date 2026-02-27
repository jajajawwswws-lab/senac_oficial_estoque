document.addEventListener("DOMContentLoaded", () => {
    // ==================== INICIALIZAÇÃO ====================
    carregarTodosDados();
    
    // ==================== GRÁFICO ====================
    function atualizarGrafico() {
        const statusCtx = document.getElementById('statusChart')?.getContext('2d');
        if (!statusCtx) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const emUso = itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = itens.filter(i => i.status === 'defeito').length;
        const emManutencao = itens.filter(i => i.status === 'manutencao').length;
        
        // Destruir gráfico anterior se existir
        if (window.statusChart) {
            window.statusChart.destroy();
        }
        
        window.statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Em Uso', 'Com Defeito', 'Em Manutenção'],
                datasets: [{
                    data: [
                        emUso || 856, 
                        comDefeito || 142, 
                        emManutencao || 250
                    ],
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
            
            // Gerar ID sequencial
            const itens = JSON.parse(localStorage.getItem('itens') || '[]');
            const novoId = itens.length > 0 
                ? Math.max(...itens.map(i => i.id)) + 1 
                : 1;
            
            const novoItem = {
                id: novoId,
                nome: nome,
                categoria: categoria,
                localizacao: localizacao,
                responsavel: responsavel,
                status: 'em_uso',
                dataCadastro: new Date().toLocaleDateString('pt-BR'),
                dataHora: new Date().toLocaleString('pt-BR')
            };
            
            itens.push(novoItem);
            localStorage.setItem('itens', JSON.stringify(itens));
            
            // Adicionar à tabela sem recarregar a página
            adicionarItemNaTabela(novoItem);
            atualizarGrafico();
            
            // Registrar atividade
            registrarAtividade('Novo item adicionado', nome);
            
            alert("✅ Item adicionado com sucesso!");
        });
    }

    // ==================== CARREGAR ITENS NA TABELA ====================
    function carregarItensTabela() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        tbody.innerHTML = '';
        
        itens.forEach(item => {
            adicionarItemNaTabela(item);
        });
    }

    function adicionarItemNaTabela(item) {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ITM-${String(item.id).padStart(3, '0')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.nome}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.categoria}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.localizacao}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.responsavel}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="visual text-blue-600 hover:text-blue-900 mr-3" data-id="${item.id}"><i class="fas fa-eye"></i></button>
                <button class="comentario text-orange hover:text-orange-600 mr-3" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="lixeira text-red-600 hover:text-red-900" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    // ==================== CARREGAR ITENS COM DEFEITO ====================
    function carregarItensDefeito() {
        const container = document.querySelector('#defective-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        const itensDefeito = itens.filter(i => i.status === 'defeito');
        
        container.innerHTML = '';
        
        itensDefeito.forEach(item => {
            const defeito = defeitos.find(d => d.item === item.nome) || { defeito: 'Defeito não especificado' };
            
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-red-50 rounded-lg';
            div.innerHTML = `
                <div>
                    <p class="item_dft font-medium">${item.nome}</p>
                    <p class="description_dft text-xs text-gray-500">${defeito.defeito}</p>
                </div>
                <button class="btndefeito text-orange hover:text-orange-600" data-item="${item.nome}">
                    <i class="fas fa-tools"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    // ==================== CARREGAR ITENS EM MANUTENÇÃO ====================
    function carregarItensManutencao() {
        const container = document.querySelector('#maintenance-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const itensManutencao = itens.filter(i => i.status === 'manutencao');
        
        container.innerHTML = '';
        
        itensManutencao.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-orange-50 rounded-lg';
            div.innerHTML = `
                <div>
                    <p class="font-medium">${item.nome}</p>
                    <p class="text-xs text-gray-500">Em manutenção</p>
                </div>
                <div class="flex space-x-2">
                    <button class="positive text-green-600 hover:text-green-800" data-item="${item.nome}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="negative text-red-600 hover:text-red-800" data-item="${item.nome}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    // ==================== REGISTRAR ATIVIDADE ====================
    function registrarAtividade(acao, item) {
        const atividadeContainer = document.querySelector('.space-y-4');
        if (!atividadeContainer) return;
        
        const agora = new Date();
        const tempo = `${agora.getHours()} horas atrás`;
        
        const icons = {
            'Novo item adicionado': 'fa-box-open bg-blue-100 text-blue-800',
            'Item enviado para manutenção': 'fa-tools bg-orange-100 text-orange-600',
            'Item marcado como defeituoso': 'fa-times-circle bg-red-100 text-red-600',
            'Item consertado': 'fa-check-circle bg-green-100 text-green-600'
        };
        
        const iconInfo = icons[acao] || 'fa-box-open bg-blue-100 text-blue-800';
        const [icon, bgClass, textClass] = iconInfo.split(' ');
        
        const novaAtividade = document.createElement('div');
        novaAtividade.className = 'flex items-start';
        novaAtividade.innerHTML = `
            <div class="p-2 ${bgClass} rounded-lg ${textClass} mr-3">
                <i class="fas ${icon}"></i>
            </div>
            <div>
                <p class="text-sm font-medium">${acao}</p>
                <p class="text-xs text-gray-500">${item} - ${tempo}</p>
            </div>
        `;
        
        // Inserir no início da lista
        atividadeContainer.insertBefore(novaAtividade, atividadeContainer.firstChild);
        
        // Limitar a 5 atividades
        while (atividadeContainer.children.length > 5) {
            atividadeContainer.removeChild(atividadeContainer.lastChild);
        }
    }

    // ==================== BOTÕES DE DEFEITO ====================
    function configurarBotoesDefeito() {
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
                    descricaoElement.textContent = novoDefeito;
                    
                    const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
                    defeitos.push({
                        id: Date.now(),
                        item: item,
                        defeito: novoDefeito,
                        data: new Date().toLocaleDateString('pt-BR'),
                        hora: new Date().toLocaleTimeString('pt-BR')
                    });
                    localStorage.setItem('defeitos', JSON.stringify(defeitos));
                    
                    const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                    const itemIndex = itens.findIndex(i => i.nome === item);
                    if (itemIndex !== -1) {
                        itens[itemIndex].status = 'defeito';
                        localStorage.setItem('itens', JSON.stringify(itens));
                    }
                    
                    registrarAtividade('Item marcado como defeituoso', item);
                    atualizarGrafico();
                    
                    alert(`✅ Defeito registrado: ${novoDefeito}`);
                }
            });
        });
    }

    // ==================== BOTÕES DE MANUTENÇÃO ====================
    function configurarBotoesManutencao() {
        document.querySelectorAll(".positive").forEach(btn => {
            btn.addEventListener("click", (event) => {
                const container = event.currentTarget.closest('.flex');
                if (!container) return;
                
                const itemElement = container.querySelector('.font-medium');
                if (!itemElement) return;
                
                const item = itemElement.textContent;
                
                if (confirm(`O item "${item}" foi consertado?`)) {
                    const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                    const itemIndex = itens.findIndex(i => i.nome === item);
                    if (itemIndex !== -1) {
                        itens[itemIndex].status = 'em_uso';
                        localStorage.setItem('itens', JSON.stringify(itens));
                    }
                    
                    container.remove();
                    registrarAtividade('Item consertado', item);
                    atualizarGrafico();
                    
                    alert(`✅ Item "${item}" foi recuperado com sucesso!`);
                }
            });
        });

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
                    const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                    const novosItens = itens.filter(i => i.nome !== item);
                    localStorage.setItem('itens', JSON.stringify(novosItens));
                    
                    container.remove();
                    registrarAtividade('Item descartado', item);
                    atualizarGrafico();
                    
                    alert(`❌ Item "${item}" foi descartado.`);
                } else {
                    alert(`🔄 Item "${item}" continuará em manutenção.`);
                }
            });
        });
    }

    // ==================== BOTÕES VISUALIZAR ====================
    function configurarBotoesVisualizar() {
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
    }

    // ==================== BOTÕES COMENTÁRIO ====================
    function configurarBotoesComentario() {
        document.querySelectorAll(".comentario").forEach(btn => {
            btn.addEventListener("click", (event) => {
                const row = event.currentTarget.closest('tr');
                if (!row) return;
                
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return;
                
                const item = cells[1]?.textContent || 'N/A';
                
                const comentario = prompt(`Adicionar comentário para o item "${item}":`);
                
                if (comentario && comentario.trim() !== "") {
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
    }

    // ==================== BOTÕES LIXEIRA ====================
    function configurarBotoesLixeira() {
        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.addEventListener("click", (event) => {
                const row = event.currentTarget.closest('tr');
                if (!row) return;
                
                const cells = row.querySelectorAll('td');
                if (cells.length < 2) return;
                
                const item = cells[1]?.textContent || 'N/A';
                const id = cells[0]?.textContent || 'N/A';
                
                if (confirm(`Tem certeza que deseja remover o item "${item}" (${id})?`)) {
                    const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                    const novosItens = itens.filter(i => i.nome !== item && i.id !== id);
                    localStorage.setItem('itens', JSON.stringify(novosItens));
                    
                    row.remove();
                    
                    const remocoes = JSON.parse(localStorage.getItem('remocoes') || '[]');
                    remocoes.push({
                        id: Date.now(),
                        item: item,
                        data: new Date().toLocaleDateString('pt-BR'),
                        hora: new Date().toLocaleTimeString('pt-BR')
                    });
                    localStorage.setItem('remocoes', JSON.stringify(remocoes));
                    
                    registrarAtividade('Item removido', item);
                    atualizarGrafico();
                    
                    alert(`✅ Item "${item}" removido com sucesso!`);
                }
            });
        });
    }

    // ==================== FUNÇÃO PRINCIPAL ====================
    function carregarTodosDados() {
        carregarItensTabela();
        carregarItensDefeito();
        carregarItensManutencao();
        atualizarGrafico();
        
        // Configurar eventos
        configurarBotoesDefeito();
        configurarBotoesManutencao();
        configurarBotoesVisualizar();
        configurarBotoesComentario();
        configurarBotoesLixeira();
        
        console.log('✅ Dados carregados com sucesso!');
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
