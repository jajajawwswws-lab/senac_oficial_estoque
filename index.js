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
// Limpar mensagens de erro
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
// Mostrar erro no campo
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
// Callback chamado pelo reCAPTCHA v2
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 onSubmit chamado com token");
    
    // Prevenir múltiplos envios
    if (isSubmitting) {
        console.log('Submissão já em andamento');
        return;
    }
    
    // Limpar mensagens anteriores
    limparMensagens();
    
    // Obter elementos do formulário
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('resultado');
    const loginForm = document.getElementById('loginForm');
    
    // Verificar se os elementos existem
    if (!emailInput || !passwordInput || !resultado) {
        console.error('❌ Elementos do formulário não encontrados');
        alert('Erro ao carregar o formulário. Recarregue a página.');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validar campos
    if (!validarCampos(email, password)) {
        // Resetar reCAPTCHA para permitir nova tentativa
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
        return;
    }

    // Marcar como enviando
    isSubmitting = true;
    
    resultado.style.color = "black";
    resultado.style.backgroundColor = "#f0f0f0";
    resultado.style.border = "1px solid #ccc";
    resultado.style.padding = "10px";
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
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw { status: response.status, data };
        }
        return data;
    })
    .then(data => {
        console.log("✅ Resposta do backend:", data);

        if (data.success) {
            mostrarSucesso("✅ Login realizado com sucesso! Redirecionando...");

            // Redirecionar após 1.5 segundos
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1500);
        } else {
            resultado.style.color = "red";
            resultado.textContent = data.error || "E-mail ou senha incorretos!";
            
            if (data.field === 'email') {
                mostrarErroCampo(emailInput, data.error || "E-mail não encontrado");
            } else if (data.field === 'password') {
                mostrarErroCampo(passwordInput, data.error || "Senha incorreta");
            }
            
            isSubmitting = false;
            
            // Resetar reCAPTCHA para nova tentativa
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }
        }
    })
    .catch(error => {
        console.error("❌ Erro:", error);
        
        let mensagem = "❌ Erro de conexão com o servidor.";
        if (error.data && error.data.error) {
            mensagem = error.data.error;
        }
        
        resultado.style.color = "red";
        resultado.textContent = mensagem;
        
        isSubmitting = false;
        
        // Resetar reCAPTCHA para nova tentativa
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
    });
};

// ===============================
// Inicialização quando a página carrega
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada, inicializando...");
    
    // Verificar elementos
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');
    const resultado = document.getElementById('resultado');
    
    console.log("📋 Elementos encontrados:");
    console.log("- email:", emailInput ? "✅" : "❌");
    console.log("- password:", passwordInput ? "✅" : "❌");
    console.log("- loginForm:", loginForm ? "✅" : "❌");
    console.log("- resultado:", resultado ? "✅" : "❌");
    
    if (!emailInput || !passwordInput || !loginForm) {
        console.error("❌ Elementos críticos não encontrados!");
        return;
    }
    
    // Configurar formulário para prevenir envio padrão
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("📝 Formulário submetido - aguardando reCAPTCHA");
        // O reCAPTCHA já chama onSubmit automaticamente
    });
    
    // Limpar mensagens ao digitar
    emailInput.addEventListener('input', function() {
        this.classList.remove('border-red-500');
        const resultado = document.getElementById('resultado');
        if (resultado) {
            resultado.textContent = '';
            resultado.style.backgroundColor = '';
            resultado.style.border = 'none';
        }
    });
    
    passwordInput.addEventListener('input', function() {
        this.classList.remove('border-red-500');
        const resultado = document.getElementById('resultado');
        if (resultado) {
            resultado.textContent = '';
            resultado.style.backgroundColor = '';
            resultado.style.border = 'none';
        }
    });
    
    console.log("✅ Sistema de login inicializado!");
});
