// profile.js - Funcionalidades de perfil com LocalStorage

// ==================== DADOS DO USUÁRIO ====================
const usuarioPadrao = {
    nome: "User Name",
    email: "user@senacestoque.com",
    telefone: "(11) 99999-9999",
    departamento: "Tecnologia da Informação",
    cargo: "Administrador do Sistema",
    avatar: "https://ui-avatars.com/api/?name=User+Name&background=1e3a8a&color=fff&size=128",
    dataCadastro: "Jan/2023",
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
            acao: "Adicionou novo item ao estoque",
            descricao: "Monitor Dell 24\" foi adicionado ao estoque",
            data: "Hoje, 10:30 AM",
            icone: "fa-box-open"
        },
        {
            acao: "Solicitou manutenção",
            descricao: "Teclado Mecânico enviado para manutenção",
            data: "Ontem, 03:15 PM",
            icone: "fa-tools"
        },
        {
            acao: "Exportou relatório mensal",
            descricao: "Relatório de estoque - Novembro 2023",
            data: "2 dias atrás",
            icone: "fa-file-export"
        },
        {
            acao: "Atualizou status de item",
            descricao: "Notebook Dell marcado como \"Em Uso\"",
            data: "3 dias atrás",
            icone: "fa-check-circle"
        }
    ]
};

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página de perfil carregada");
    
    // Inicializar dados do usuário se não existirem
    inicializarDadosUsuario();
    
    // Carregar dados do usuário na interface
    carregarDadosUsuario();
    
    // Carregar estatísticas
    carregarEstatisticas();
    
    // Carregar atividades recentes
    carregarAtividades();
    
    // Carregar configurações
    carregarConfiguracoes();
    
    // Configurar eventos
    configurarEventos();
});

// ==================== INICIALIZAR DADOS ====================
function inicializarDadosUsuario() {
    if (!localStorage.getItem('usuario')) {
        localStorage.setItem('usuario', JSON.stringify(usuarioPadrao));
        console.log("✅ Dados de usuário inicializados no localStorage");
    }
    
    if (!localStorage.getItem('usuario_configuracoes')) {
        localStorage.setItem('usuario_configuracoes', JSON.stringify(usuarioPadrao.configuracoes));
    }
}

// ==================== CARREGAR DADOS ====================
function carregarDadosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Atualizar nome
    document.querySelector('h2.text-2xl')?.textContent = usuario.nome || 'User Name';
    
    // Atualizar cargo
    document.querySelector('.text-gray-600.mb-2')?.textContent = usuario.cargo || 'Administrador do Sistema';
    
    // Atualizar badges
    document.querySelectorAll('.flex.flex-wrap .rounded-full').forEach(badge => {
        if (badge.textContent.includes('Desde:')) {
            badge.innerHTML = `<i class="fas fa-calendar-check mr-1"></i> Desde: ${usuario.dataCadastro || 'Jan/2023'}`;
        }
    });
    
    // Atualizar avatar
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
        avatarImg.src = usuario.avatar || `https://ui-avatars.com/api/?name=${usuario.nome?.replace(' ', '+') || 'User+Name'}&background=1e3a8a&color=fff&size=128`;
    }
    
    // Atualizar informações de contato
    const infoGrid = document.querySelectorAll('.grid-cols-1.md\\:grid-cols-3 .font-medium');
    if (infoGrid.length >= 3) {
        infoGrid[0].textContent = usuario.email || 'user@senacestoque.com';
        infoGrid[1].textContent = usuario.telefone || '(11) 99999-9999';
        infoGrid[2].textContent = usuario.departamento || 'Tecnologia da Informação';
    }
}

// ==================== CARREGAR ESTATÍSTICAS ====================
function carregarEstatisticas() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const stats = usuario.estatisticas || usuarioPadrao.estatisticas;
    
    const statBoxes = document.querySelectorAll('.bg-blue-50, .bg-green-50, .bg-orange-50, .bg-purple-50');
    
    if (statBoxes.length >= 4) {
        // Itens Gerenciados
        statBoxes[0].querySelector('.text-2xl').textContent = stats.itensGerenciados || 150;
        // Itens Adicionados
        statBoxes[1].querySelector('.text-2xl').textContent = stats.itensAdicionados || 142;
        // Manutenções Solicitadas
        statBoxes[2].querySelector('.text-2xl').textContent = stats.manutencoesSolicitadas || 8;
        // Relatórios Gerados
        statBoxes[3].querySelector('.text-2xl').textContent = stats.relatoriosGerados || 24;
    }
}

// ==================== CARREGAR ATIVIDADES ====================
function carregarAtividades() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const atividades = usuario.atividades || usuarioPadrao.atividades;
    
    const timeline = document.querySelector('.activity-timeline');
    if (!timeline) return;
    
    timeline.innerHTML = '';
    
    atividades.forEach(atividade => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${atividade.icone || 'fa-history'}"></i>
            </div>
            <div class="activity-content">
                <p class="font-medium">${atividade.acao}</p>
                <p class="text-sm text-gray-500">${atividade.descricao}</p>
                <span class="text-xs text-gray-400">${atividade.data}</span>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// ==================== CARREGAR CONFIGURAÇÕES ====================
function carregarConfiguracoes() {
    const configuracoes = JSON.parse(localStorage.getItem('usuario_configuracoes') || '{}');
    
    // Notificações por Email
    const emailSwitch = document.querySelector('.switch input[type="checkbox"]');
    if (emailSwitch) {
        emailSwitch.checked = configuracoes.notificacoesEmail !== undefined ? 
            configuracoes.notificacoesEmail : true;
    }
    
    // Autenticação em Dois Fatores
    const doisFatoresSwitches = document.querySelectorAll('.switch input[type="checkbox"]');
    if (doisFatoresSwitches.length >= 2) {
        doisFatoresSwitches[1].checked = configuracoes.autenticacaoDoisFatores || false;
    }
    
    // Modo Escuro
    if (doisFatoresSwitches.length >= 3) {
        doisFatoresSwitches[2].checked = configuracoes.modoEscuro || false;
        
        // Aplicar modo escuro se estiver ativado
        if (configuracoes.modoEscuro) {
            document.body.classList.add('dark-mode');
        }
    }
}

// ==================== SALVAR CONFIGURAÇÕES ====================
function salvarConfiguracoes() {
    const switches = document.querySelectorAll('.switch input[type="checkbox"]');
    
    const configuracoes = {
        notificacoesEmail: switches[0]?.checked || false,
        autenticacaoDoisFatores: switches[1]?.checked || false,
        modoEscuro: switches[2]?.checked || false
    };
    
    localStorage.setItem('usuario_configuracoes', JSON.stringify(configuracoes));
    
    // Aplicar modo escuro
    if (configuracoes.modoEscuro) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    return configuracoes;
}

// ==================== CONFIGURAR EVENTOS ====================
function configurarEventos() {
    // Toggle sidebar
    window.toggleSidebar = function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('collapsed');
        
        const chevron = document.querySelector('.fa-chevron-left, .fa-chevron-right');
        if (chevron) {
            if (sidebar.classList.contains('collapsed')) {
                chevron.classList.remove('fa-chevron-left');
                chevron.classList.add('fa-chevron-right');
            } else {
                chevron.classList.remove('fa-chevron-right');
                chevron.classList.add('fa-chevron-left');
            }
        }
    };

    // Avatar upload
    document.querySelector('.edit-avatar-btn')?.addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const avatarImg = document.querySelector('.profile-avatar img');
                    avatarImg.src = event.target.result;
                    
                    // Salvar avatar no localStorage
                    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
                    usuario.avatar = event.target.result;
                    localStorage.setItem('usuario', JSON.stringify(usuario));
                    
                    showNotification('Foto de perfil atualizada com sucesso!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Toggle switches
    document.querySelectorAll('.switch input').forEach(switchEl => {
        switchEl.addEventListener('change', function() {
            const container = this.closest('.flex');
            const settingName = container?.querySelector('.font-medium')?.textContent || 'Configuração';
            const isEnabled = this.checked;
            
            // Salvar configurações
            salvarConfiguracoes();
            
            showNotification(`${settingName} ${isEnabled ? 'ativado' : 'desativado'}`, 'info');
        });
    });

    // Botão Editar Perfil
    document.querySelector('.bg-orange.text-white')?.addEventListener('click', function() {
        editarPerfil();
    });

    // Botão Salvar Preferências
    document.querySelector('button.bg-darkblue')?.addEventListener('click', function() {
        const button = this;
        const originalText = button.textContent;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
        button.disabled = true;
        
        setTimeout(() => {
            salvarConfiguracoes();
            showNotification('Preferências salvas com sucesso!', 'success');
            button.textContent = originalText;
            button.disabled = false;
        }, 500);
    });
    
    // Configurações de Privacidade
    const privacyBtn = document.querySelector('.fa-user-shield')?.closest('button');
    if (privacyBtn) {
        privacyBtn.addEventListener('click', function() {
            showNotification('Configurações de privacidade em desenvolvimento', 'info');
        });
    }
}

// ==================== FUNÇÃO DE EDIÇÃO DE PERFIL ====================
function editarPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    const nome = prompt("Nome completo:", usuario.nome || "User Name");
    if (!nome) return;
    
    const email = prompt("Email:", usuario.email || "user@senacestoque.com");
    if (!email) return;
    
    const telefone = prompt("Telefone:", usuario.telefone || "(11) 99999-9999");
    if (!telefone) return;
    
    const departamento = prompt("Departamento:", usuario.departamento || "Tecnologia da Informação");
    if (!departamento) return;
    
    const cargo = prompt("Cargo:", usuario.cargo || "Administrador do Sistema");
    if (!cargo) return;
    
    // Atualizar dados
    usuario.nome = nome;
    usuario.email = email;
    usuario.telefone = telefone;
    usuario.departamento = departamento;
    usuario.cargo = cargo;
    
    // Salvar
    localStorage.setItem('usuario', JSON.stringify(usuario));
    
    // Recarregar interface
    carregarDadosUsuario();
    
    showNotification('Perfil atualizado com sucesso!', 'success');
}

// ==================== FUNÇÃO DE NOTIFICAÇÃO ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type] || 'fa-info-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ==================== FUNÇÃO DE EXPORTAÇÃO DE DADOS ====================
function exportarDadosPerfil() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const configuracoes = JSON.parse(localStorage.getItem('usuario_configuracoes') || '{}');
    
    const dados = {
        usuario,
        configuracoes,
        dataExportacao: new Date().toLocaleString('pt-BR')
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfil_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showNotification('Dados exportados com sucesso!', 'success');
}

// ==================== FUNÇÃO DE ALTERAÇÃO DE SENHA ====================
function alterarSenha() {
    const senhaAtual = prompt("Digite sua senha atual:");
    if (!senhaAtual) return;
    
    // Simular verificação de senha (em produção, isso seria feito no backend)
    const senhaCorreta = 'senha123'; // Isso seria verificado no backend
    
    if (senhaAtual !== senhaCorreta) {
        showNotification('Senha atual incorreta!', 'error');
        return;
    }
    
    const novaSenha = prompt("Digite sua nova senha (mínimo 8 caracteres):");
    if (!novaSenha) return;
    
    if (novaSenha.length < 8) {
        showNotification('A senha deve ter pelo menos 8 caracteres!', 'error');
        return;
    }
    
    if (!/[A-Z]/.test(novaSenha) || !/[0-9]/.test(novaSenha)) {
        showNotification('A senha deve conter pelo menos uma letra maiúscula e um número!', 'error');
        return;
    }
    
    const confirmarSenha = prompt("Confirme sua nova senha:");
    if (novaSenha !== confirmarSenha) {
        showNotification('As senhas não conferem!', 'error');
        return;
    }
    
    // Aqui você enviaria para o backend
    showNotification('Senha alterada com sucesso!', 'success');
}

// ==================== FUNÇÃO DE EXCLUSÃO DE CONTA ====================
function excluirConta() {
    if (confirm('⚠️ TEM CERTEZA QUE DESEJA EXCLUIR SUA CONTA?\nEsta ação não pode ser desfeita!')) {
        const confirmacao = prompt('Digite "EXCLUIR" para confirmar:');
        
        if (confirmacao === 'EXCLUIR') {
            // Limpar dados do localStorage
            localStorage.removeItem('usuario');
            localStorage.removeItem('usuario_configuracoes');
            localStorage.removeItem('sessao');
            
            showNotification('Conta excluída com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification('Operação cancelada', 'info');
        }
    }
}

// Adicionar CSS para modo escuro
const style = document.createElement('style');
style.textContent = `
    .dark-mode {
        background-color: #1a202c !important;
        color: #e2e8f0 !important;
    }
    .dark-mode .bg-white {
        background-color: #2d3748 !important;
        color: #e2e8f0 !important;
    }
    .dark-mode .text-gray-800 {
        color: #e2e8f0 !important;
    }
    .dark-mode .text-gray-600 {
        color: #a0aec0 !important;
    }
    .dark-mode .border-gray-200 {
        border-color: #4a5568 !important;
    }
`;
document.head.appendChild(style);
