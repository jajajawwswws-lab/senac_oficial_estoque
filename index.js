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
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.textContent = '';
        resultado.style.color = '';
    }
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.classList.remove('border-red-500', 'border-red-400');
    if (passwordInput) passwordInput.classList.remove('border-red-500', 'border-red-400');
}

// ===============================
// Mostrar erro no campo
// ===============================
function mostrarErroCampo(inputElement, mensagem) {
    if (inputElement) {
        inputElement.classList.add('border-red-500');
    }
    
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.style.color = 'red';
        resultado.textContent = mensagem;
    }
}

// ===============================
// FUNÇÃO PRINCIPAL - Chamada pelo reCAPTCHA
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 onSubmit chamado com token:", token ? "OK" : "Nulo");
    
    // Prevenir múltiplos envios
    if (isSubmitting) {
        console.log('Submissão já em andamento');
        return;
    }
    
    // Limpar mensagens anteriores
    limparMensagens();
    
    // OBTER ELEMENTOS DO DOM - COM VERIFICAÇÃO DETALHADA
    console.log("🔍 Procurando elementos do formulário...");
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('result');
    const loginButton = document.getElementById('loginButton');
    
    // Verificar cada elemento e logar o resultado
    console.log("📋 Status dos elementos:");
    console.log("- email:", emailInput ? "✅ Encontrado" : "❌ Não encontrado");
    console.log("- password:", passwordInput ? "✅ Encontrado" : "❌ Não encontrado");
    console.log("- result:", resultado ? "✅ Encontrado" : "❌ Não encontrado");
    console.log("- loginButton:", loginButton ? "✅ Encontrado" : "❌ Não encontrado");
    
    // Se algum elemento não for encontrado, tentar novamente após um pequeno delay
    if (!emailInput || !passwordInput || !resultado) {
        console.error('❌ Elementos do formulário não encontrados!');
        
        // Tentar novamente após 100ms (útil para páginas com carregamento lento)
        setTimeout(() => {
            console.log("🔄 Tentando novamente...");
            window.onSubmit(token);
        }, 100);
        return;
    }
    
    // Se chegou aqui, os elementos existem
    console.log("✅ Todos os elementos encontrados!");
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Validar campos
    if (!validarCampos(email, password)) {
        return;
    }

    // Marcar como enviando
    isSubmitting = true;
    if (loginButton) loginButton.disabled = true;
    
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
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            throw { status: response.status, data };
        }
        return data;
    })
    .then(data => {
        console.log("✅ Resposta do backend:", data);

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
            
            if (data.field === 'email') {
                mostrarErroCampo(emailInput, data.error || "E-mail não encontrado");
            } else if (data.field === 'password') {
                mostrarErroCampo(passwordInput, data.error || "Senha incorreta");
            }
            
            isSubmitting = false;
            if (loginButton) loginButton.disabled = false;
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
        if (loginButton) loginButton.disabled = false;
    });
};

// ===============================
// INICIALIZAÇÃO - Quando a página carrega
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada, inicializando...");
    
    // Configurar toggle de senha
    setupPasswordToggle();
    
    // Verificar elementos após carregamento
    setTimeout(() => {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const loginForm = document.getElementById('loginForm');
        const resultado = document.getElementById('result');
        
        console.log("📋 Verificação pós-carregamento:");
        console.log("- email:", emailInput ? "✅" : "❌");
        console.log("- password:", passwordInput ? "✅" : "❌");
        console.log("- loginForm:", loginForm ? "✅" : "❌");
        console.log("- result:", resultado ? "✅" : "❌");
        
        if (!emailInput || !passwordInput || !loginForm) {
            console.error("❌ Elementos críticos não encontrados!");
            console.log("Verifique se os IDs no HTML estão corretos:");
            console.log("- Deve ter: id='email'");
            console.log("- Deve ter: id='password'"); 
            console.log("- Deve ter: id='loginForm'");
        }
    }, 500);
    
    // Configurar formulário
    const loginForm = document.getElementById('loginForm');
    const loginButton = document.getElementById('loginButton');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("📝 Formulário submetido");
            
            // Verificar se o botão está habilitado
            if (loginButton && !loginButton.disabled) {
                // Verificar se reCAPTCHA está disponível
                if (typeof grecaptcha === 'undefined' || !grecaptcha) {
                    console.error('❌ reCAPTCHA não carregado');
                    const resultado = document.getElementById('result');
                    if (resultado) {
                        resultado.style.color = "red";
                        resultado.textContent = "❌ Erro ao carregar reCAPTCHA. Recarregue a página.";
                    }
                    return;
                }
                
                console.log("🤖 Executando reCAPTCHA...");
                
                // Executar reCAPTCHA
                grecaptcha.ready(function() {
                    grecaptcha.execute('6LctSXksAAAAAM19sUp0Z0wRZ7nAMIxlLGe7EDgf', {action: 'submit'})
                        .then(function(token) {
                            console.log("✅ Token reCAPTCHA obtido");
                            window.onSubmit(token);
                        })
                        .catch(function(error) {
                            console.error('❌ Erro no reCAPTCHA:', error);
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
        console.error('❌ Formulário de login não encontrado!');
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

// Backup: Se o DOM já estiver carregado quando o script executar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {});
} else {
    // DOM já está pronto, disparar manualmente
    console.log("⚡ DOM já carregado, executando inicialização...");
    setTimeout(() => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
    }, 100);
}
