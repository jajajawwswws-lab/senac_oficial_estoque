// ===============================
// LOGIN COM LOCALSTORAGE - VERSÃO CORRIGIDA
// ===============================

// Verificar se já está logado
const sessao = JSON.parse(localStorage.getItem('sessao'));
if (sessao && sessao.email) {
    window.location.href = "account.html";
}

// Variável de controle
let isSubmitting = false;

// Função do reCAPTCHA
window.onSubmit = function(token) {
    console.log("🔑 Tentativa de login...");

    if (isSubmitting) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('result'); // ID CORRIGO: 'result'

    // Limpar mensagens anteriores
    if (resultadoDiv) {
        resultadoDiv.textContent = '';
        resultadoDiv.style.color = '';
    }
    emailInput?.classList.remove('border-red-500');
    passwordInput?.classList.remove('border-red-500');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    // Validações básicas
    if (!email || !password) {
        alert("Preencha todos os campos!");
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }

    isSubmitting = true;
    if (resultadoDiv) resultadoDiv.textContent = "🔄 Verificando...";

    // Simular delay de rede
    setTimeout(() => {
        try {
            // 1. Buscar usuários do LocalStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            console.log("📋 Usuários cadastrados:", usuarios);

            // 2. Procurar pelo email
            const usuario = usuarios.find(u => u.email === email);

            // 3. Validações
            if (!usuario) {
                console.log("❌ Email não encontrado");
                if (resultadoDiv) {
                    resultadoDiv.style.color = 'red';
                    resultadoDiv.textContent = "❌ E-mail não cadastrado!";
                }
                emailInput?.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            if (usuario.password !== password) {
                console.log("❌ Senha incorreta");
                if (resultadoDiv) {
                    resultadoDiv.style.color = 'red';
                    resultadoDiv.textContent = "❌ Senha incorreta!";
                }
                passwordInput?.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            // 4. SUCESSO!
            console.log("✅ Login bem-sucedido:", email);
            if (resultadoDiv) {
                resultadoDiv.style.color = 'green';
                resultadoDiv.textContent = "✅ Login realizado! Redirecionando...";
            }

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
            console.error("❌ Erro no login:", error);
            if (resultadoDiv) {
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ Erro interno. Tente novamente.";
            }
            isSubmitting = false;
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    }, 800); // Delay de 800ms
};

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página de login carregada");

    // Mostrar usuários salvos para debug (opcional)
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("Usuários disponíveis para login:", usuarios.map(u => u.email));

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('result'); // ID CORRIGO

    // Evento do formulário (acionado pelo botão g-recaptcha)
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // Limpar mensagens de erro ao digitar
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            emailInput.classList.remove('border-red-500');
            if (resultadoDiv) resultadoDiv.textContent = '';
        });
    }
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            passwordInput.classList.remove('border-red-500');
            if (resultadoDiv) resultadoDiv.textContent = '';
        });
    }
});
