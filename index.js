// ===============================
// LOGIN COM LOCALSTORAGE - VERSÃO COM DEBUG
// ===============================

// Verificar se já está logado
try {
    const sessao = JSON.parse(localStorage.getItem('sessao'));
    if (sessao && sessao.email) {
        console.log("✅ Já logado como:", sessao.email);
        window.location.href = "account.html";
    }
} catch (e) {
    console.log("Nenhuma sessão ativa");
}

let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 Tentativa de login...");
    console.log("Token reCAPTCHA:", token ? "✅ OK" : "❌ Ausente");

    if (isSubmitting) {
        console.log("⏳ Já processando...");
        return;
    }

    // Pegar elementos
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('result');

    // DEBUG: Verificar elementos
    console.log("📋 Elementos do formulário:");
    console.log("- Email input:", emailInput ? "✅" : "❌");
    console.log("- Password input:", passwordInput ? "✅" : "❌");
    console.log("- Result div:", resultadoDiv ? "✅" : "❌");

    if (!emailInput || !passwordInput || !resultadoDiv) {
        alert("Erro ao carregar formulário. Recarregue a página.");
        return;
    }

    // Limpar mensagens
    resultadoDiv.textContent = '';
    resultadoDiv.style.color = '';
    emailInput.classList.remove('border-red-500');
    passwordInput.classList.remove('border-red-500');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log("📝 Dados do formulário:");
    console.log("- Email digitado:", email);
    console.log("- Senha digitada:", password ? "******" : "❌ VAZIA");

    if (!email || !password) {
        alert("Preencha todos os campos!");
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }

    isSubmitting = true;
    resultadoDiv.textContent = "🔄 Verificando...";

    setTimeout(() => {
        try {
            // Buscar usuários do LocalStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            
            console.log("📊 TOTAL DE USUÁRIOS NO SISTEMA:", usuarios.length);
            console.log("📋 LISTA COMPLETA DE EMAILS CADASTRADOS:");
            usuarios.forEach((u, i) => {
                console.log(`   ${i+1}. "${u.email}"`);
            });

            // Procurar email (ignorando maiúsculas/minúsculas)
            const usuario = usuarios.find(u => 
                u.email.toLowerCase().trim() === email.toLowerCase().trim()
            );

            console.log("🔍 RESULTADO DA BUSCA:");
            if (usuario) {
                console.log("   ✅ Email ENCONTRADO!");
                console.log("   - Username:", usuario.username);
                console.log("   - Senha no sistema:", usuario.password);
                console.log("   - Senha fornecida:", password);
            } else {
                console.log("   ❌ Email NÃO ENCONTRADO na lista acima");
            }

            if (!usuario) {
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ E-mail não cadastrado!";
                emailInput.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            if (usuario.password !== password) {
                console.log("❌ SENHA INCORRETA");
                console.log("   - Esperada:", usuario.password);
                console.log("   - Recebida:", password);
                
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ Senha incorreta!";
                passwordInput.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            // SUCESSO!
            console.log("🎉 LOGIN BEM-SUCEDIDO!");
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
            console.error("❌ ERRO GRAVE:", error);
            resultadoDiv.style.color = 'red';
            resultadoDiv.textContent = "❌ Erro interno. Tente novamente.";
            isSubmitting = false;
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    }, 800);
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 PÁGINA DE LOGIN CARREGADA");
    
    // MOSTRAR STATUS ATUAL
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("📊 USUÁRIOS DISPONÍVEIS AGORA:", usuarios.length);
    console.log("📋 EMAIS CADASTRADOS:", usuarios.map(u => u.email));

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultadoDiv = document.getElementById('result');

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
