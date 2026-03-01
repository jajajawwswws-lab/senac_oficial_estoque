// ===============================
// SISTEMA DE LOGIN SIMPLIFICADO
// ===============================

// Verificar se já está logado
const sessao = JSON.parse(localStorage.getItem('sessao'));
if (sessao && sessao.email) {
    // Se já estiver logado, redireciona para account
    window.location.href = "account.html";
}

// Configurar toggle de senha
function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
}

// Limpar mensagens
function limparMensagens() {
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.textContent = '';
        resultado.style.color = '';
        resultado.style.backgroundColor = '';
    }
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.classList.remove('border-red-500');
    if (passwordInput) passwordInput.classList.remove('border-red-500');
}

// Mostrar erro
function mostrarErro(mensagem, campo = null) {
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.style.color = 'red';
        resultado.style.backgroundColor = '#ffeeee';
        resultado.style.border = '1px solid #ffcccc';
        resultado.style.padding = '10px';
        resultado.style.borderRadius = '5px';
        resultado.style.marginTop = '10px';
        resultado.textContent = mensagem;
    }
    
    if (campo === 'email') {
        document.getElementById('email')?.classList.add('border-red-500');
    } else if (campo === 'password') {
        document.getElementById('password')?.classList.add('border-red-500');
    }
}

// Mostrar sucesso
function mostrarSucesso(mensagem) {
    const resultado = document.getElementById('resultado');
    if (result) {
        resultado.style.color = 'green';
        resultado.style.backgroundColor = '#eeffee';
        resultado.style.border = '1px solid #ccffcc';
        resultado.style.padding = '15px';
        resultado.style.borderRadius = '5px';
        resultado.style.marginTop = '10px';
        resultado.style.textAlign = 'center';
        resultado.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">✅ ${mensagem}</div>
            <div style="font-size: 12px; color: #888;">Redirecionando...</div>
        `;
    }
}

// Validar campos
function validarCampos(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        alert("O email é obrigatório.");
        return false;
    }

    if (!emailRegex.test(email)) {
        alert("Digite um e-mail válido.");
        return false;
    }

    if (!password) {
        alert("A senha é obrigatória.");
        return false;
    }

    if (password.length < 8) {
        alert("A senha deve conter pelo menos 8 caracteres.");
        return false;
    }

    return true;
}

// Callback do reCAPTCHA
window.onSubmit = function(token) {
    console.log("🔑 Fazendo login...");
    
    limparMensagens();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const result = document.getElementById('resultado');
    
    if (!email || !password) {
        alert('Preencha todos os campos');
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }
    
    if (!validarCampos(email, password)) {
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }
    
    resultado.textContent = "🔄 Verificando...";
    
    // ===== SIMULAR DELAY DE REDE =====
    setTimeout(() => {
        try {
            // Buscar usuários do LocalStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            
            console.log("📋 Usuários cadastrados:", usuarios);
            
            // Procurar usuário
            const usuario = usuarios.find(u => u.email === email);
            
            if (!usuario) {
                mostrarErro("❌ E-mail não cadastrado!", 'email');
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }
            
            if (usuario.password !== password) {
                mostrarErro("❌ Senha incorreta!", 'password');
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }
            
            // Sucesso!
            mostrarSucesso("Login realizado com sucesso!");
            
            // Salvar sessão
            localStorage.setItem('sessao', JSON.stringify({
                email: usuario.email,
                username: usuario.username,
                loginTime: new Date().toISOString()
            }));
            
            // Redirecionar
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1500);
            
        } catch (error) {
            console.error("Erro:", error);
            mostrarErro("❌ Erro ao fazer login");
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    }, 1000);
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada");
    
    setupPasswordToggle();
    
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('resultado');
    
    if (!loginForm) {
        console.error("❌ Formulário não encontrado");
        return;
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.execute();
        }
    });
    
    // Limpar mensagens ao digitar
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            if (resultado) resultado.textContent = '';
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            if (resultado) resultado.textContent = '';
        });
    }
    
    // Mostrar usuários para debug
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("📋 Usuários disponíveis:", usuarios);
});