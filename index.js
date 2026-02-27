// ===============================
// LOGIN COM LOCALSTORAGE - VERSÃO CORRIGIDA
// ===============================

// Verificar se já está logado
const sessao = JSON.parse(localStorage.getItem('sessao'));
if (sessao && sessao.email) {
    window.location.href = "account.html";
}

let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 Tentativa de login...");

    if (isSubmitting) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('resultado'); // ✅ AGORA ESTÁ CERTO!

    // Limpar mensagens anteriores
    if (resultadoDiv) {
        resultadoDiv.textContent = '';
        resultadoDiv.style.color = '';
    }
    emailInput?.classList.remove('border-red-500');
    passwordInput?.classList.remove('border-red-500');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
        alert("Preencha todos os campos!");
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }

    isSubmitting = true;
    if (resultadoDiv) resultadoDiv.textContent = "🔄 Verificando...";

    setTimeout(() => {
        try {
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            
            console.log("📋 Usuários cadastrados:", usuarios.map(u => u.email));

            const usuario = usuarios.find(u => 
                u.email.toLowerCase().trim() === email.toLowerCase().trim()
            );

            if (!usuario) {
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ E-mail não cadastrado!";
                emailInput?.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            if (usuario.password !== password) {
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ Senha incorreta!";
                passwordInput?.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            resultadoDiv.style.color = 'green';
            resultadoDiv.textContent = "✅ Login realizado! Redirecionando...";

            localStorage.setItem('sessao', JSON.stringify({
                email: usuario.email,
                username: usuario.username,
                loginTime: new Date().toISOString()
            }));

            setTimeout(() => {
                window.location.href = "account.html";
            }, 1500);

        } catch (error) {
            console.error("❌ Erro:", error);
            resultadoDiv.style.color = 'red';
            resultadoDiv.textContent = "❌ Erro interno.";
            isSubmitting = false;
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    }, 800);
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página de login carregada");
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("Usuários disponíveis:", usuarios.length);

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('resultado'); // ✅ TAMBÉM CORRIGIDO AQUI

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => e.preventDefault());
    }

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
