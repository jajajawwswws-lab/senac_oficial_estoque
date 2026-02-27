// ===============================
// LOGIN - VERSÃO QUE SE ADAPTA
// ===============================

// Verificar sessão
try {
    const sessao = JSON.parse(localStorage.getItem('sessao'));
    if (sessao && sessao.email) {
        window.location.href = "account.html";
    }
} catch (e) {}

let isSubmitting = false;

window.onSubmit = function(token) {
    console.log("🔑 Tentativa de login...");

    if (isSubmitting) return;

    // ===== PROCURAR ELEMENTOS DE DIVERSAS FORMAS =====
    const emailInput = document.getElementById('email') || 
                      document.querySelector('input[type="email"]') ||
                      document.querySelector('input[name="email"]');
    
    const passwordInput = document.getElementById('password') || 
                         document.querySelector('input[type="password"]') ||
                         document.querySelector('input[name="password"]');
    
    const resultadoDiv = document.getElementById('result') || 
                        document.getElementById('resultado') ||
                        document.querySelector('.message') ||
                        document.querySelector('#resultado');
    
    const loginForm = document.getElementById('loginForm') || 
                     document.querySelector('form');

    // DEBUG: Mostrar o que encontrou
    console.log("📋 Elementos encontrados:");
    console.log("- Email:", emailInput);
    console.log("- Senha:", passwordInput);
    console.log("- Resultado:", resultadoDiv);
    console.log("- Form:", loginForm);

    if (!emailInput || !passwordInput || !resultadoDiv) {
        console.error("❌ Elementos não encontrados!");
        
        // Tenta encontrar qualquer input na página
        const allInputs = document.querySelectorAll('input');
        console.log("Inputs disponíveis:", allInputs.length);
        allInputs.forEach((input, i) => {
            console.log(`Input ${i+1}:`, {
                id: input.id,
                type: input.type,
                name: input.name,
                class: input.className
            });
        });
        
        alert("Erro ao carregar formulário. Verifique o console (F12) para mais detalhes.");
        return;
    }

    // Limpar mensagens
    resultadoDiv.textContent = '';
    resultadoDiv.style.color = '';
    emailInput.classList.remove('border-red-500');
    passwordInput.classList.remove('border-red-500');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Preencha todos os campos!");
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        return;
    }

    isSubmitting = true;
    resultadoDiv.textContent = "🔄 Verificando...";

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
                emailInput.classList.add('border-red-500');
                isSubmitting = false;
                if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                return;
            }

            if (usuario.password !== password) {
                resultadoDiv.style.color = 'red';
                resultadoDiv.textContent = "❌ Senha incorreta!";
                passwordInput.classList.add('border-red-500');
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
            console.error("Erro:", error);
            resultadoDiv.style.color = 'red';
            resultadoDiv.textContent = "❌ Erro interno.";
            isSubmitting = false;
            if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        }
    }, 800);
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Página carregada");
    
    // Mostrar status
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    console.log("Usuários disponíveis:", usuarios.length);
    
    // Prevenir submit padrão
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => e.preventDefault());
    }
});
