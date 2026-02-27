// account.js - VERSÃO FUNCIONAL COM LOCALSTORAGE
document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Página carregada");
    
    // ==================== DADOS INICIAIS ====================
    if (!localStorage.getItem('itens')) {
        const itensIniciais = [
            {
                id: 1,
                nome: "Monitor Dell 24\"",
                categoria: "Eletrônicos",
                localizacao: "Sala 201",
                responsavel: "bot1",
                status: "em_uso",
                dataCadastro: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 2,
                nome: "Notebook Dell XPS",
                categoria: "Eletrônicos",
                localizacao: "Sala 302",
                responsavel: "bot2",
                status: "em_uso",
                dataCadastro: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 3,
                nome: "Cadeira Ergonômica",
                categoria: "Mobília",
                localizacao: "Sala 105",
                responsavel: "bot3",
                status: "em_uso",
                dataCadastro: new Date().toLocaleDateString('pt-BR')
            }
        ];
        localStorage.setItem('itens', JSON.stringify(itensIniciais));
    }
    
    if (!localStorage.getItem('defeitos')) {
        localStorage.setItem('defeitos', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('comentarios')) {
        localStorage.setItem('comentarios', JSON.stringify([]));
    }
    
    // ==================== CARREGAR DADOS ====================
    carregarTabelaItens();
    carregarItensDefeito();
    carregarItensManutencao();
    carregarGrafico();
    carregarAtividadesRecentes();
    
    // ==================== GRÁFICO ====================
    function carregarGrafico() {
        const ctx = document.getElementById('statusChart')?.getContext('2d');
        if (!ctx) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const emUso = itens.filter(i => i.status === 'em_uso').length;
        const comDefeito = itens.filter(i => i.status === 'defeito').length;
        const manutencao = itens.filter(i => i.status === 'manutencao').length;
        
        // Destruir gráfico antigo se existir
        if (window.meuGrafico) {
            window.meuGrafico.destroy();
        }
        
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
    
    // ==================== TABELA DE ITENS ====================
    function carregarTabelaItens() {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        tbody.innerHTML = '';
        
        itens.forEach(item => {
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
        });
        
        // Configurar eventos dos botões
        configurarBotoes();
    }
    
    // ==================== ITENS COM DEFEITO ====================
    function carregarItensDefeito() {
        const container = document.querySelector('#defective-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
        const itensDefeito = itens.filter(i => i.status === 'defeito');
        
        container.innerHTML = '';
        
        if (itensDefeito.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Nenhum item com defeito</p>';
            return;
        }
        
        itensDefeito.forEach(item => {
            const defeito = defeitos.find(d => d.itemId === item.id) || { defeito: 'Defeito não especificado' };
            
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-red-50 rounded-lg';
            div.innerHTML = `
                <div>
                    <p class="font-medium">${item.nome}</p>
                    <p class="text-xs text-gray-500">${defeito.defeito}</p>
                </div>
                <button class="btndefeito text-orange hover:text-orange-600" data-id="${item.id}">
                    <i class="fas fa-tools"></i>
                </button>
            `;
            container.appendChild(div);
        });
        
        configurarBotoesDefeito();
    }
    
    // ==================== ITENS EM MANUTENÇÃO ====================
    function carregarItensManutencao() {
        const container = document.querySelector('#maintenance-items .space-y-4');
        if (!container) return;
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const itensManutencao = itens.filter(i => i.status === 'manutencao');
        
        container.innerHTML = '';
        
        if (itensManutencao.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center">Nenhum item em manutenção</p>';
            return;
        }
        
        itensManutencao.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-3 bg-orange-50 rounded-lg';
            div.innerHTML = `
                <div>
                    <p class="font-medium">${item.nome}</p>
                    <p class="text-xs text-gray-500">Em manutenção</p>
                </div>
                <div class="flex space-x-2">
                    <button class="positive text-green-600 hover:text-green-800" data-id="${item.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="negative text-red-600 hover:text-red-800" data-id="${item.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
        
        configurarBotoesManutencao();
    }
    
    // ==================== ATIVIDADES RECENTES ====================
    function carregarAtividadesRecentes() {
        const container = document.querySelector('.space-y-4');
        if (!container) return;
        
        // Atividades padrão
        const atividades = [
            { acao: 'Novo item adicionado', item: 'Monitor Dell 24"', tempo: '2 minutos atrás', icon: 'fa-box-open', bg: 'bg-blue-100', text: 'text-blue-800' },
            { acao: 'Item enviado para manutenção', item: 'Teclado Mecânico', tempo: '15 minutos atrás', icon: 'fa-tools', bg: 'bg-orange-100', text: 'text-orange-600' },
            { acao: 'Item marcado como defeituoso', item: 'Mouse sem fio', tempo: '1 hora atrás', icon: 'fa-times-circle', bg: 'bg-red-100', text: 'text-red-600' },
            { acao: 'Item consertado', item: 'Notebook Dell', tempo: '3 horas atrás', icon: 'fa-check-circle', bg: 'bg-green-100', text: 'text-green-600' }
        ];
        
        container.innerHTML = '';
        
        atividades.forEach(ativ => {
            const div = document.createElement('div');
            div.className = 'flex items-start';
            div.innerHTML = `
                <div class="p-2 ${ativ.bg} rounded-lg ${ativ.text} mr-3">
                    <i class="fas ${ativ.icon}"></i>
                </div>
                <div>
                    <p class="text-sm font-medium">${ativ.acao}</p>
                    <p class="text-xs text-gray-500">${ativ.item} - ${ativ.tempo}</p>
                </div>
            `;
            container.appendChild(div);
        });
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
        
        const itens = JSON.parse(localStorage.getItem('itens') || '[]');
        const novoId = itens.length > 0 ? Math.max(...itens.map(i => i.id)) + 1 : 1;
        
        const novoItem = {
            id: novoId,
            nome: nome,
            categoria: categoria,
            localizacao: localizacao,
            responsavel: responsavel,
            status: 'em_uso',
            dataCadastro: new Date().toLocaleDateString('pt-BR')
        };
        
        itens.push(novoItem);
        localStorage.setItem('itens', JSON.stringify(itens));
        
        alert("✅ Item adicionado!");
        window.location.reload();
    });
    
    // ==================== CONFIGURAR BOTÕES ====================
    function configurarBotoes() {
        // Botões visualizar
        document.querySelectorAll(".visual").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (item) {
                    alert(`👁️ Visualizando:\nID: #ITM-${String(id).padStart(3, '0')}\nNome: ${item.nome}\nCategoria: ${item.categoria}\nLocal: ${item.localizacao}\nResponsável: ${item.responsavel}`);
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
                
                const comentario = prompt(`Adicionar comentário para "${item?.nome}":`);
                if (comentario) {
                    alert(`💬 Comentário salvo: "${comentario}"`);
                }
            });
        });
        
        // Botões lixeira
        document.querySelectorAll(".lixeira").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (confirm(`Remover item "${item?.nome}"?`)) {
                    const novosItens = itens.filter(i => i.id != id);
                    localStorage.setItem('itens', JSON.stringify(novosItens));
                    btn.closest('tr').remove();
                    alert("✅ Item removido!");
                }
            });
        });
    }
    
    function configurarBotoesDefeito() {
        document.querySelectorAll(".btndefeito").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                const defeito = prompt(`Descreva o defeito do item "${item?.nome}":`);
                if (defeito) {
                    item.status = 'defeito';
                    localStorage.setItem('itens', JSON.stringify(itens));
                    
                    const defeitos = JSON.parse(localStorage.getItem('defeitos') || '[]');
                    defeitos.push({
                        id: Date.now(),
                        itemId: item.id,
                        item: item.nome,
                        defeito: defeito,
                        data: new Date().toLocaleDateString('pt-BR'),
                        hora: new Date().toLocaleTimeString('pt-BR')
                    });
                    localStorage.setItem('defeitos', JSON.stringify(defeitos));
                    
                    alert(`🔧 Defeito registrado: ${defeito}`);
                    window.location.reload();
                }
            });
        });
    }
    
    function configurarBotoesManutencao() {
        document.querySelectorAll(".positive").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (confirm(`Item "${item?.nome}" foi consertado?`)) {
                    item.status = 'em_uso';
                    localStorage.setItem('itens', JSON.stringify(itens));
                    alert(`✅ Item recuperado!`);
                    window.location.reload();
                }
            });
        });
        
        document.querySelectorAll(".negative").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const id = btn.dataset.id;
                const itens = JSON.parse(localStorage.getItem('itens') || '[]');
                const item = itens.find(i => i.id == id);
                
                if (confirm(`Descartar item "${item?.nome}"?`)) {
                    const novosItens = itens.filter(i => i.id != id);
                    localStorage.setItem('itens', JSON.stringify(novosItens));
                    btn.closest('.flex').remove();
                    alert(`❌ Item descartado!`);
                }
            });
        });
    }
    
    // ==================== SIDEBAR ====================
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.toggle('collapsed');
    };
});
