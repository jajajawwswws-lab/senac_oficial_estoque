// profile.js - Funcionalidades específicas para a página de perfil

// Toggle sidebar (mantido do original)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('collapsed');
}

// Avatar upload simulation
document.querySelector('.edit-avatar-btn')?.addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.querySelector('.profile-avatar img').src = event.target.result;
                showNotification('Foto de perfil atualizada com sucesso!', 'success');
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
});

// Toggle switches functionality
document.querySelectorAll('.switch input').forEach(switchEl => {
    switchEl.addEventListener('change', function() {
        const settingName = this.closest('.flex').querySelector('.font-medium').textContent;
        const isEnabled = this.checked;
        
        showNotification(`${settingName} ${isEnabled ? 'ativado' : 'desativado'}`, 'info');
        
        // Aqui você poderia fazer uma chamada AJAX para salvar a preferência
        // saveUserPreference(settingName, isEnabled);
    });
});

// Save preferences button
document.querySelector('button.bg-darkblue')?.addEventListener('click', function() {
    const button = this;
    const originalText = button.textContent;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Salvando...';
    button.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Preferências salvas com sucesso!', 'success');
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
});

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
        type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
        'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' :
                type === 'error' ? 'fa-exclamation-circle' :
                'fa-info-circle'
            } mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
/*
function alterar_senha()
{
    const senha = prompt("digite sua senha: ");

    const senha_correta = 'senha123';


    if(senha === senha_correta)
        {
            alert("Senha correta");
            const nova_senha = prompt("digite sua nova senha: ");
            if(nova_senha.match('/^.{13,}$/'))
                {
                    alert("Senha valida!\n Sua senha foi alterada.");
                }else if(!nova_senha.match('/^.{13,}$/'))
                    alert("Sua senha nao preenche 13 caracteres requisitados.");
        }
}
*/

document.addEventListener('DOMContentLoaded', function() {
    const btnAlterarSenha = document.getElementById('btn-alterar-senha');
    
    if (btnAlterarSenha) {
        btnAlterarSenha.addEventListener('click', function(e) {
            e.preventDefault();
            alterar_senha(); // ou alterarSenhaAvancado()
        });
    }
});

// Initialize tooltips for action buttons
document.querySelectorAll('[title]').forEach(el => {
    el.addEventListener('mouseenter', function() {
        // Simple tooltip implementation could be added here
    });
});

// Add hover effects to all interactive elements
document.querySelectorAll('button, .card-hover, .activity-item, .switch').forEach(el => {
    el.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.2s ease';
    });
});