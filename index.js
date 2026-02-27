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

    // Consistente com create.js (mínimo 8 caracteres)
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
            
            // Trocar ícone
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
}

// ===============================
// Limpar mensagens de erro
// ===============================
function limparMensagens() {
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.textContent = '';
        resultado.style.color = '';
    }
    
    // Remover bordas vermelhas dos campos
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.classList.remove('border-red-500', 'border-red-400');
    if (passwordInput) passwordInput.classList.remove('border-red-500', 'border-red-400');
}

// ===============================
// Mostrar erro no campo
// ===============================
function mostrarErroCampo(inputElement, mensagem) {
    // Adicionar borda vermelha
    inputElement.classList.add('border-red-500');
    
    // Mostrar mensagem no resultado
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.style.color = 'red';
        resultado.textContent = mensagem;
    }
}

// ===============================
// Callback chamado pelo reCAPTCHA
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    // Prevenir múltiplos envios
    if (isSubmitting) {
        console.log('Submissão já em andamento');
        return;
    }
    
    // Limpar mensagens anteriores
    limparMensagens();
    
    // Obter elementos do DOM
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('result');
    
    if (!emailInput || !passwordInput || !resultado) {
        console.error('Elementos do formulário não encontrados');
        alert('Erro ao carregar o formulário');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validar campos
    if (!validarCampos(email, password)) {
        return;
    }

    // Marcar como enviando
    isSubmitting = true;
    
    resultado.style.color = "black";
    resultado.textContent = "🔄 Verificando...";

    // Enviar para o backend
    fetch('/api/backend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            recaptchaToken: token
        })
    })
    .then(async response => {
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `Erro HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Resposta do backend:", data);

        if (data.success) {
            resultado.style.color = "green";
            resultado.textContent = "✅ Login realizado com sucesso!";

            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1000);
        } else {
            resultado.style.color = "red";
            resultado.textContent = data.error || "E-mail ou senha incorretos!";
            
            // Destacar campos com erro
            if (data.field === 'email') {
                mostrarErroCampo(emailInput, data.error || "E-mail não encontrado");
            } else if (data.field === 'password') {
                mostrarErroCampo(passwordInput, data.error || "Senha incorreta");
            }
            
            isSubmitting = false;
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        resultado.style.color = "red";
        resultado.textContent = "❌ Erro de conexão com o servidor.";
        isSubmitting = false;
    });
};

// ===============================
// Inicialização quando a página carrega
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    // Configurar toggle de senha
    setupPasswordToggle();
    
    // Configurar formulário
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Verificar se o botão está habilitado
            if (loginButton && !loginButton.disabled) {
                // Executar reCAPTCHA
                grecaptcha.ready(function() {
                    grecaptcha.execute('6LctSXksAAAAAM19sUp0Z0wRZ7nAMIxlLGe7EDgf', {action: 'submit'}).then(function(token) {
                        window.onSubmit(token);
                    }).catch(function(error) {
                        console.error('Erro no reCAPTCHA:', error);
                        const resultado = document.getElementById('result');
                        if (resultado) {
                            resultado.style.color = "red";
                            resultado.textContent = "❌ Erro ao verificar reCAPTCHA. Tente novamente.";
                        }
                    });
                });
            }
        });
    } else {
        console.error('Formulário de login não encontrado');
    }
    
    // Limpar mensagens ao digitar
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            const resultado = document.getElementById('result');
            if (resultado && resultado.style.color === 'red') {
                resultado.textContent = '';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            const resultado = document.getElementById('result');
            if (resultado && resultado.style.color === 'red') {
                resultado.textContent = '';
            }
        });
    }
});
