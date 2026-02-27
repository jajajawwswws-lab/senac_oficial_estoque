// profile.js - Versão com backend API

// ==================== ESTADO GLOBAL ====================
let usuarioAtual = null;
let token = null;

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página de perfil carregada");
    
    // Verificar se está logado
    verificarLogin();
});

// ==================== VERIFICAR LOGIN ====================
async function verificarLogin() {
    // Tentar recuperar token do localStorage
    token = localStorage.getItem('auth_token');
    
    if (!token) {
        // Se não estiver logado, redirecionar para login
        window.location.href = 'index.html';
        return;
    }
    
    // Carregar dados do perfil
    await carregarDadosPerfil();
}

// ==================== CARREGAR DADOS ====================
async function carregarDadosPerfil() {
    try {
        mostrarLoading(true);
        
        // Buscar dados do perfil
        const response = await fetch('/api/profile-api');
        const result = await response.json();
        
        if (result.success) {
            usuarioAtual = result.data;
            
            // Atualizar interface
            atualizarInterface();
            
            // Carregar atividades
            await carregarAtividades();
            
            console.log("✅ Dados carregados:", usuarioAtual);
        } else {
            showNotification('Erro ao carregar perfil', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro de conexão com o servidor', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// ==================== ATUALIZAR INTERFACE ====================
function atualizarInterface() {
    if (!usuarioAtual) return;
    
    // Nome
    document.querySelector('h2.text-2xl').textContent = usuarioAtual.nome;
    
    // Cargo
    document.querySelector('.text-gray-600.mb-2').textContent = usuarioAtual.cargo;
    
    // Badge de data
    const badges = document.querySelectorAll('.flex.flex-wrap .rounded-full');
    badges.forEach(badge => {
        if (badge.textContent.includes('Desde:')) {
            badge.innerHTML = `<i class="fas fa-calendar-check mr-1"></i> Desde: ${usuarioAtual.dataCadastro}`;
        }
    });
    
    // Avatar
    const avatarImg = document.querySelector('.profile-avatar img');
    if (avatarImg) {
        avatarImg.src = usuarioAtual.avatar;
    }
    
    // Informações de contato
    const infoGrid = document.querySelectorAll('.grid-cols-1.md\\:grid-cols-3 .font-medium');
    if (infoGrid.length >= 3) {
        infoGrid[0].textContent = usuarioAtual.email;
        infoGrid[1].textContent = usuarioAtual.telefone;
        infoGrid[2].textContent = usuarioAtual.departamento;
    }
    
    // Estatísticas
    const statBoxes = document.querySelectorAll('.bg-blue-50, .bg-green-50, .bg-orange-50, .bg-purple-50');
    if (statBoxes.length >= 4) {
        statBoxes[0].querySelector('.text-2xl').textContent = usuarioAtual.estatisticas.itensGerenciados;
        statBoxes[1].querySelector('.text-2xl').textContent = usuarioAtual.estatisticas.itensAdicionados;
        statBoxes[2].querySelector('.text-2xl').textContent = usuarioAtual.estatisticas.manutencoesSolicitadas;
        statBoxes[3].querySelector('.text-2xl').textContent = usuarioAtual.estatisticas.relatoriosGerados;
    }
    
    // Configurações
    const switches = document.querySelectorAll('.switch input[type="checkbox"]');
    if (switches.length >= 3) {
        switches[0].checked = usuarioAtual.configuracoes.notificacoesEmail;
        switches[1].checked = usuarioAtual.configuracoes.autenticacaoDoisFatores;
        switches[2].checked = usuarioAtual.configuracoes.modoEscuro;
    }
}

// ==================== CARREGAR ATIVIDADES ====================
async function carregarAtividades() {
    try {
        const response = await fetch('/api/profile/atividades');
        const result = await response.json();
        
        if (result.success) {
            const timeline = document.querySelector('.activity-timeline');
            if (!timeline) return;
            
            timeline.innerHTML = '';
            
            result.data.forEach(atividade => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                item.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${atividade.icone}"></i>
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
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
    }
}

// ==================== FUNÇÕES DE INTERAÇÃO ====================

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

// Upload de avatar
document.querySelector('.edit-avatar-btn')?.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            try {
                mostrarLoading(true);
                
                const response = await fetch('/api/profile/avatar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        avatar: event.target.result
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    document.querySelector('.profile-avatar img').src = event.target.result;
                    showNotification('Foto de perfil atualizada!', 'success');
                    
                    // Registrar atividade
                    await fetch('/api/profile/atividades', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            acao: "Avatar atualizado",
                            descricao: "Foto de perfil alterada",
                            icone: "fa-camera"
                        })
                    });
                }
            } catch (error) {
                console.error('Erro:', error);
                showNotification('Erro ao atualizar avatar', 'error');
            } finally {
                mostrarLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
});

// Toggle switches
document.querySelectorAll('.switch input').forEach(switchEl => {
    switchEl.addEventListener('change', async function() {
        const container = this.closest('.flex');
        const settingName = container?.querySelector('.font-medium')?.textContent || 'Configuração';
        const isEnabled = this.checked;
        
        try {
            const switches = document.querySelectorAll('.switch input[type="checkbox"]');
            const response = await fetch('/api/profile/configuracoes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    notificacoesEmail: switches[0]?.checked || false,
                    autenticacaoDoisFatores: switches[1]?.checked || false,
                    modoEscuro: switches[2]?.checked || false
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`${settingName} ${isEnabled ? 'ativado' : 'desativado'}`, 'success');
            }
        } catch (error) {
            console.error('Erro:', error);
            showNotification('Erro ao salvar configuração', 'error');
            // Reverter o switch em caso de erro
            this.checked = !isEnabled;
        }
    });
});

// Botão Editar Perfil
document.querySelector('.bg-orange.text-white')?.addEventListener('click', async function() {
    if (!usuarioAtual) return;
    
    const nome = prompt("Nome completo:", usuarioAtual.nome);
    if (!nome) return;
    
    const email = prompt("Email:", usuarioAtual.email);
    if (!email) return;
    
    const telefone = prompt("Telefone:", usuarioAtual.telefone);
    if (!telefone) return;
    
    const departamento = prompt("Departamento:", usuarioAtual.departamento);
    if (!departamento) return;
    
    const cargo = prompt("Cargo:", usuarioAtual.cargo);
    if (!cargo) return;
    
    try {
        mostrarLoading(true);
        
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome, email, telefone, departamento, cargo
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            usuarioAtual = { ...usuarioAtual, nome, email, telefone, departamento, cargo };
            atualizarInterface();
            showNotification('Perfil atualizado!', 'success');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao atualizar perfil', 'error');
    } finally {
        mostrarLoading(false);
    }
});

// Botão Salvar Configurações
document.querySelector('button.bg-darkblue')?.addEventListener('click', async function() {
    const button = this;
    const originalText = button.textContent;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
    button.disabled = true;
    
    try {
        const switches = document.querySelectorAll('.switch input[type="checkbox"]');
        
        const response = await fetch('/api/profile/configuracoes', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                notificacoesEmail: switches[0]?.checked || false,
                autenticacaoDoisFatores: switches[1]?.checked || false,
                modoEscuro: switches[2]?.checked || false
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Configurações salvas!', 'success');
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao salvar configurações', 'error');
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
});

// Botão de privacidade
const privacyBtn = document.querySelector('.fa-user-shield')?.closest('button');
if (privacyBtn) {
    privacyBtn.addEventListener('click', function() {
        showNotification('Configurações de privacidade em desenvolvimento', 'info');
    });
}

// Botão de exclusão de conta
document.querySelector('.fa-trash-alt')?.closest('button')?.addEventListener('click', async function(e) {
    e.preventDefault();
    
    if (!confirm('⚠️ TEM CERTEZA QUE DESEJA EXCLUIR SUA CONTA?\nEsta ação não pode ser desfeita!')) {
        return;
    }
    
    const confirmacao = prompt('Digite "EXCLUIR" para confirmar:');
    
    if (confirmacao !== 'EXCLUIR') {
        showNotification('Operação cancelada', 'info');
        return;
    }
    
    try {
        mostrarLoading(true);
        
        const response = await fetch('/api/profile', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            localStorage.removeItem('auth_token');
            showNotification('Conta excluída!', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Erro:', error);
        showNotification('Erro ao excluir conta', 'error');
    } finally {
        mostrarLoading(false);
    }
});

// ==================== FUNÇÕES UTILITÁRIAS ====================

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
            <i class="fas ${icons[type]} mr-3"></i>
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
