// ===============================
// Validação de campos
// ===============================
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

// ===============================
// Mostrar/ocultar senha
// ===============================
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

// ===============================
// Limpar mensagens
// ===============================
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

// ===============================
// Mostrar erro
// ===============================
function mostrarErroCampo(inputElement, mensagem) {
    if (inputElement) {
        inputElement.classList.add('border-red-500');
    }
    
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.style.color = 'red';
        resultado.style.backgroundColor = '#ffeeee';
        resultado.style.border = '1px solid #ffcccc';
        resultado.style.padding = '10px';
        resultado.textContent = mensagem;
    }
}

// ===============================
// Mostrar sucesso
// ===============================
function mostrarSucesso(mensagem) {
    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.style.color = 'green';
        resultado.style.backgroundColor = '#eeffee';
        resultado.style.border = '1px solid #ccffcc';
        resultado.style.padding = '10px';
        resultado.textContent = mensagem;
    }
}

// ===============================
// Callback do reCAPTCHA
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 onSubmit chamado");
    
    if (isSubmitting) return;
    
    limparMensagens();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('resultado');
    const loginButton = document.getElementById('loginButton');
    
    if (!emailInput || !passwordInput || !resultado) {
        alert('Erro ao carregar o formulário');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!validarCampos(email, password)) {
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }

    isSubmitting = true;
    if (loginButton) loginButton.disabled = true;
    
    resultado.textContent = "🔄 Verificando...";

    // ===== SIMULAÇÃO DE BACKEND USANDO LOCALSTORAGE =====
    setTimeout(() => {
        try {
            // Buscar usuários do LocalStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            console.log("📋 Usuários cadastrados:", usuarios);
            
            // Procurar usuário
            const usuario = usuarios.find(u => u.email === email);
            
            if (!usuario) {
                resultado.style.color = "red";
                resultado.textContent = "❌ E-mail não cadastrado!";
                mostrarErroCampo(emailInput, "E-mail não encontrado");
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                isSubmitting = false;
                if (loginButton) loginButton.disabled = false;
                return;
            }
            
            if (usuario.password !== password) {
                resultado.style.color = "red";
                resultado.textContent = "❌ Senha incorreta!";
                mostrarErroCampo(passwordInput, "Senha incorreta");
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                isSubmitting = false;
                if (loginButton) loginButton.disabled = false;
                return;
            }
            
            // Sucesso!
            mostrarSucesso("✅ Login realizado com sucesso! Redirecionando...");
            
            // Salvar sessão (opcional)
            localStorage.setItem('sessao', JSON.stringify({
                email: usuario.email,
                username: usuario.username,
                loginTime: new Date().toISOString()
            }));
            
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1500);
            
        } catch (error) {
            console.error("Erro:", error);
            resultado.style.color = "red";
            resultado.textContent = "❌ Erro ao processar login";
            isSubmitting = false;
            if (loginButton) loginButton.disabled = false;
        }
    }, 1000); // Simular delay de rede
};

// ===============================
// Inicialização
// ===============================
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
        // O reCAPTCHA v2 chama onSubmit automaticamente
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
    
    // Mostrar usuários cadastrados (para debug)
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("📋 Usuários no LocalStorage:", usuarios);
});
