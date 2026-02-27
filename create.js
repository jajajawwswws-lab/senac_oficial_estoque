// ===============================
// Validação de campos
// ===============================
function validarCampos(email, password, confirm_password, username, phone) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        alert("O email é obrigatório.");
        return false;
    }

    if (!emailRegex.test(email)) {
        alert("Digite um e-mail válido.");
        return false;
    }

    if (!username) {
        alert("O nome de usuário é obrigatório.");
        return false;
    }

    if (username.length < 3) {
        alert("O nome de usuário deve ter pelo menos 3 caracteres.");
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

    if (!confirm_password) {
        alert("A confirmação de senha é obrigatória.");
        return false;
    }

    if (password !== confirm_password) {
        alert("As senhas não conferem.");
        return false;
    }

    // Telefone é opcional, mas se fornecido, validar
    if (phone && phone.length < 10) {
        alert("Telefone inválido. Digite com DDD (ex: 11999999999)");
        return false;
    }

    return true;
}

// ===============================
// Mostrar/ocultar senha
// ===============================
function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
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
    
    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            
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
        resultado.style.backgroundColor = '';
        resultado.style.border = 'none';
        resultado.style.padding = '0';
    }
    
    // Remover bordas vermelhas dos campos
    const campos = ['email', 'password', 'confirm_password', 'username', 'phone'];
    campos.forEach(campo => {
        const input = document.getElementById(campo);
        if (input) {
            input.classList.remove('border-red-500');
            input.style.border = '';
        }
    });
}

// ===============================
// Mostrar erro no campo
// ===============================
function mostrarErroCampo(inputElement, mensagem) {
    if (inputElement) {
        inputElement.classList.add('border-red-500');
        inputElement.style.border = '2px solid #ff4444';
    }
    
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.style.color = 'red';
        resultado.style.backgroundColor = '#ffeeee';
        resultado.style.border = '1px solid #ffcccc';
        resultado.style.padding = '10px';
        resultado.style.borderRadius = '5px';
        resultado.style.marginTop = '10px';
        resultado.textContent = mensagem;
    }
}

// ===============================
// Mostrar sucesso
// ===============================
function mostrarSucesso(mensagem, email, username) {
    const resultado = document.getElementById('result');
    if (resultado) {
        resultado.style.color = 'green';
        resultado.style.backgroundColor = '#eeffee';
        resultado.style.border = '1px solid #ccffcc';
        resultado.style.padding = '15px';
        resultado.style.borderRadius = '5px';
        resultado.style.marginTop = '10px';
        resultado.style.textAlign = 'center';
        resultado.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 10px;">✅ ${mensagem}</div>
            <div style="font-size: 14px; margin-bottom: 5px;">Bem-vindo, ${username}!</div>
            <div style="font-size: 12px; color: #666;">Email: ${email}</div>
            <div style="font-size: 12px; margin-top: 10px; color: #888;">Redirecionando para o login...</div>
        `;
    }
}

// ===============================
// Aguardar elementos carregarem
// ===============================
function aguardarElementos() {
    return new Promise((resolve) => {
        const elementos = ['email', 'password', 'confirm_password', 'username', 'result', 'registerForm'];
        
        if (elementos.every(id => document.getElementById(id))) {
            resolve();
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            if (elementos.every(id => document.getElementById(id))) {
                obs.disconnect();
                resolve();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout de segurança
        setTimeout(resolve, 3000);
    });
}

// ===============================
// Callback chamado pelo reCAPTCHA
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 onSubmit chamado no cadastro");
    
    if (isSubmitting) {
        console.log('Submissão já em andamento');
        return;
    }
    
    limparMensagens();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    const resultado = document.getElementById('result');
    const registerButton = document.getElementById('registerButton');
    
    // Verificação dos elementos
    if (!emailInput || !passwordInput || !confirmPasswordInput || !usernameInput || !resultado) {
        console.error('❌ Elementos não encontrados');
        alert('Erro ao carregar o formulário. Recarregue a página.');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirm_password = confirmPasswordInput.value;
    const username = usernameInput.value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';

    // Validar campos
    if (!validarCampos(email, password, confirm_password, username, phone)) {
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
        }
        return;
    }

    isSubmitting = true;
    if (registerButton) {
        registerButton.disabled = true;
        registerButton.textContent = 'Registrando...';
    }
    
    resultado.style.color = "black";
    resultado.style.backgroundColor = "#f0f0f0";
    resultado.style.border = "1px solid #ccc";
    resultado.style.padding = "10px";
    resultado.style.borderRadius = "5px";
    resultado.textContent = "🔄 Criando sua conta...";

    // ===== SIMULAÇÃO DE CADASTRO USANDO LOCALSTORAGE =====
    setTimeout(() => {
        try {
            // Buscar usuários existentes
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            console.log("📋 Usuários existentes:", usuarios);
            
            // Verificar se email já existe
            const usuarioExistente = usuarios.find(u => u.email === email);
            
            if (usuarioExistente) {
                resultado.style.color = "red";
                resultado.style.backgroundColor = "#ffeeee";
                resultado.textContent = "❌ Este email já está cadastrado!";
                mostrarErroCampo(emailInput, "Email já cadastrado");
                
                isSubmitting = false;
                if (registerButton) {
                    registerButton.disabled = false;
                    registerButton.textContent = 'Registrar';
                }
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }
            
            // Criar novo usuário
            const novoUsuario = {
                email: email,
                password: password,
                username: username,
                phone: phone || '',
                createdAt: new Date().toISOString()
            };
            
            // Adicionar ao array
            usuarios.push(novoUsuario);
            
            // Salvar no LocalStorage
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            console.log("✅ Usuário salvo no LocalStorage:", novoUsuario);
            console.log("📋 Total de usuários:", usuarios.length);
            
            // Mostrar sucesso
            mostrarSucesso("Conta criada com sucesso!", email, username);
            
            // Redirecionar após 3 segundos
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
            
        } catch (error) {
            console.error("❌ Erro:", error);
            resultado.style.color = "red";
            resultado.style.backgroundColor = "#ffeeee";
            resultado.textContent = "❌ Erro ao criar conta. Tente novamente.";
            
            isSubmitting = false;
            if (registerButton) {
                registerButton.disabled = false;
                registerButton.textContent = 'Registrar';
            }
        }
    }, 1500); // Simular delay de rede
};

// ===============================
// Inicialização quando a página carrega
// ===============================
document.addEventListener('DOMContentLoaded', async function() {
    console.log("📄 Página de cadastro carregada");
    
    // Configurar toggle de senha
    setupPasswordToggle();
    
    // Aguardar elementos
    await aguardarElementos();
    
    const registerForm = document.getElementById('registerForm');
    const registerButton = document.getElementById('registerButton');
    const resultado = document.getElementById('result');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    
    if (!registerForm) {
        console.error('❌ Formulário de registro não encontrado');
        return;
    }
    
    // Configurar formulário
    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        console.log("📝 Formulário submetido");
        
        if (registerButton && !registerButton.disabled) {
            // Verificar reCAPTCHA
            if (typeof grecaptcha === 'undefined') {
                console.error('❌ reCAPTCHA não carregado');
                resultado.style.color = "red";
                resultado.textContent = "❌ Erro ao carregar reCAPTCHA";
                return;
            }
            
            // Executar reCAPTCHA
            grecaptcha.execute();
        }
    });
    
    // Limpar mensagens ao digitar
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            this.style.border = '';
            if (resultado) {
                resultado.textContent = '';
                resultado.style.backgroundColor = '';
                resultado.style.border = 'none';
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            this.style.border = '';
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            this.style.border = '';
        });
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            this.style.border = '';
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.classList.remove('border-red-500');
            this.style.border = '';
        });
    }
    
    // Mostrar usuários existentes (para debug)
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("📋 Usuários no LocalStorage:", usuarios);
    
    console.log("✅ Sistema de cadastro inicializado!");
});
