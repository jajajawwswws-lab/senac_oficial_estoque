// create.js - Frontend integrado com backend /api/register
// VERSÃO CORRETA - usa fetch para o backend

document.addEventListener('DOMContentLoaded', function() {
    // LOG DE CONFIRMAÇÃO DA VERSÃO
    console.log('✅ create.js - VERSÃO CORRETA (com fetch para /api/register)');
    console.log('🔍 Verificando localStorage antigo...');
    
    // Limpar qualquer dado antigo que possa causar confusão
    if (localStorage.getItem('users')) {
        console.warn('⚠️ Dados antigos encontrados no localStorage. Limpando...');
        localStorage.removeItem('users');
    }

    // Elementos do DOM (seu código permanece igual até linha 200)
    // ... (todo seu código existente até a linha 200)

    // Submit handler melhorado com mais logs
    async function handleSubmit(event) {
        event.preventDefault();

        if (submitButton.disabled) {
            return;
        }

        // Verificação final de validação
        const allValid = Object.values(isFormValid).every(v => v === true);
        if (!allValid) {
            showResult('Please fill all fields correctly', false);
            return;
        }

        setLoading(true);
        showResult('Creating your account...', true);

        try {
            // Obter token reCAPTCHA
            let recaptchaToken = null;
            if (typeof grecaptcha !== 'undefined') {
                try {
                    recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
                    console.log('✅ reCAPTCHA token obtido');
                } catch (recaptchaError) {
                    console.warn('reCAPTCHA error:', recaptchaError);
                }
            }

            // Preparar dados
            const userData = {
                email: emailInput.value.trim(),
                password: passwordInput.value,
                username: usernameInput.value.trim(),
                phone: phoneInput.value.trim(),
                recaptchaToken: recaptchaToken
            };

            console.log('📤 Enviando dados para /api/register:', { 
                ...userData, 
                password: '***' // Esconder senha no log
            });

            // Enviar para o backend
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('📥 Resposta do servidor:', {
                status: response.status,
                ok: response.ok
            });

            const data = await response.json();
            console.log('📦 Dados da resposta:', data);

            if (response.ok && data.success) {
                console.log('✅ USUÁRIO CRIADO NO SUPABASE! ID:', data.userId);
                showResult('Account created successfully! Redirecting...', true);
                
                // Salvar apenas email para referência (opcional)
                localStorage.setItem('last_registered_email', userData.email);
                
                // Redirecionar após 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                console.error('❌ Erro do servidor:', data.error);
                showResult(data.error || 'Registration failed', false);
                setLoading(false);
            }
        } catch (error) {
            console.error('❌ Registration error:', error);
            showResult('Connection error. Please try again.', false);
            setLoading(false);
        }
    }

    // Attach submit handler
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }

    // Inicializar validações
    setTimeout(() => {
        validateUsername();
        validateEmail();
        validatePhone();
        validatePassword();
        checkPasswordMatch();
    }, 100);
});
