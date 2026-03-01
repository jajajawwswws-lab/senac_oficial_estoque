// create.js - Versão 100% Supabase (sem localStorage)

// DEFINIR A FUNÇÃO GLOBAL ONSUBMIT IMEDIATAMENTE
window.onsubmit = function(token) {
    console.log("onSubmit called with token:", token);
};

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
    const passwordStrengthDiv = document.getElementById('passwordStrength');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const passwordMatchMessage = document.getElementById('passwordMatchMessage');
    const submitButton = document.getElementById('submitButton');
    const result = document.getElementById('result');

    // ============================================
    // CONFIGURAÇÃO SUPABASE (frontend)
    // ============================================
   // ============================================
// CONFIGURAÇÃO SUPABASE (frontend)
// ============================================
// As credenciais são definidas no HTML antes deste script carregar

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se as credenciais foram carregadas
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.error("❌ Credenciais Supabase não encontradas no window");
        console.log("Verifique se as linhas no HTML estão corretas:");
        console.log('<script>window.SUPABASE_URL = "sua-url"; window.SUPABASE_ANON_KEY = "sua-chave";</script>');
    } else {
        console.log("✅ Credenciais encontradas:", {
            url: window.SUPABASE_URL,
            key: window.SUPABASE_ANON_KEY.substring(0, 10) + "..."
        });
    }
    
    // Criar cliente Supabase
    let supabase = null;
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase) {
        supabase = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );
        console.log("✅ Supabase client inicializado");
    } else {
        console.warn("⚠️ Supabase não configurado corretamente");
    }
    
    // ... (resto do seu código)
});
    // Criar cliente Supabase (apenas se as credenciais existirem)
    let supabase = null;
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.supabase) {
        supabase = window.supabase.createClient(
            window.SUPABASE_URL,
            window.SUPABASE_ANON_KEY
        );
        console.log("✅ Supabase client inicializado");
    } else {
        console.warn("⚠️ Credenciais Supabase não encontradas");
    }

    // Validação em tempo real (MANTIDO IGUAL)
    let isFormValid = {
        username: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    };

    // Toggle de visibilidade da senha (MANTIDO IGUAL)
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }

    // Validação de username (MANTIDO IGUAL)
    usernameInput.addEventListener('input', function() {
        const username = this.value.trim();
        const pattern = /^[a-zA-Z0-9_]+$/;
        
        if (username.length < 4) {
            showFieldError(this, 'Username must be at least 4 characters');
            isFormValid.username = false;
        } else if (username.length > 15) {
            showFieldError(this, 'Username cannot exceed 15 characters');
            isFormValid.username = false;
        } else if (!pattern.test(username)) {
            showFieldError(this, 'Only letters, numbers and underscores allowed');
            isFormValid.username = false;
        } else {
            clearFieldError(this);
            isFormValid.username = true;
        }
        updateSubmitButton();
    });

    // Validação de email (MANTIDO IGUAL)
    emailInput.addEventListener('input', function() {
        const email = this.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showFieldError(this, 'Email is required');
            isFormValid.email = false;
        } else if (!emailPattern.test(email)) {
            showFieldError(this, 'Please enter a valid email address');
            isFormValid.email = false;
        } else {
            clearFieldError(this);
            isFormValid.email = true;
        }
        updateSubmitButton();
    });
    
    // Formatação e validação de telefone (MANTIDO IGUAL)
    phoneInput.addEventListener('input', function() {
        clearFieldError(this);
        
        const phoneDigits = this.value.replace(/\D/g, '');
        
        if (phoneDigits.length <= 11) {
            let formattedValue = phoneDigits;
            
            if (phoneDigits.length > 2) {
                formattedValue = '(' + phoneDigits.substring(0, 2) + ') ' + phoneDigits.substring(2);
            }
            
            if (phoneDigits.length > 7) {
                formattedValue = '(' + phoneDigits.substring(0, 2) + ') ' + 
                               phoneDigits.substring(2, 7) + '-' + 
                               phoneDigits.substring(7, 11);
            }
            
            this.value = formattedValue;
        }
        
        const digitCount = phoneDigits.length;
        
        if (digitCount >= 10) {
            const regex_phone = /^\((11|12|13|14|15|16|17|18|19|21|22|24|27|28|31|32|33|34|35|37|38|41|42|43|44|45|46|47|48|49|51|53|54|55|61|62|63|64|65|66|67|68|69|71|73|74|75|77|79|81|82|83|84|85|86|87|88|89|91|92|93|94|95|96|97|98|99)\)\s?\d{4,5}-\d{4}$/;
            
            if (!regex_phone.test(this.value)) {
                showFieldError(this, 'Please use a valid Brazilian phone number');
                isFormValid.phone = false;
            } else {
                isFormValid.phone = true;
            }
        } else {
            if (digitCount > 0) {
                showFieldError(this, 'Phone number must have at least 10 digits');
            }
            isFormValid.phone = false;
        }
        
        updateSubmitButton();
    });

    // Validação de força da senha (MANTIDO IGUAL)
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        
        if (passwordStrengthDiv) {
            passwordStrengthDiv.classList.remove('hidden');
        }
        
        const strength = calculatePasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
        
        if (password.length < 8) {
            showFieldError(this, 'Password must be at least 8 characters');
            isFormValid.password = false;
        } else {
            clearFieldError(this);
            isFormValid.password = true;
        }
        
        checkPasswordMatch();
        updateSubmitButton();
    });

    // Validação de confirmação de senha (MANTIDO IGUAL)
    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!confirmPassword) {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '';
            }
            confirmPasswordInput.style.borderColor = '';
            isFormValid.confirmPassword = false;
            return;
        }
        
        if (password === confirmPassword) {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '<span class="text-green-600">✓ Passwords match</span>';
            }
            confirmPasswordInput.style.borderColor = '#10B981';
            isFormValid.confirmPassword = true;
        } else {
            if (passwordMatchMessage) {
                passwordMatchMessage.innerHTML = '<span class="text-red-600">✗ Passwords do not match</span>';
            }
            confirmPasswordInput.style.borderColor = '#EF4444';
            isFormValid.confirmPassword = false;
        }
    }

    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        return Math.min(Math.max(Math.floor(score / 2) + 1, 1), 5);
    }

    function updatePasswordStrengthIndicator(strength) {
        if (!strengthBar || !strengthText) return;
        
        const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
        const texts = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
        
        const index = Math.max(0, Math.min(strength - 1, 4));
        const percentage = (strength / 5) * 100;
        
        strengthBar.style.width = `${percentage}%`;
        strengthBar.style.backgroundColor = colors[index];
        strengthText.textContent = texts[index];
        strengthText.style.color = colors[index];
    }

    function showFieldError(inputElement, message) {
        clearFieldError(inputElement);
        
        inputElement.classList.add('border-red-500');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'mt-1 text-sm text-red-600 fade-in';
        errorDiv.textContent = message;
        
        inputElement.parentNode.insertBefore(errorDiv, inputElement.nextSibling);
    }

    function clearFieldError(inputElement) {
        inputElement.classList.remove('border-red-500');
        
        const errorDiv = inputElement.parentNode.querySelector('.text-red-600');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    function updateSubmitButton() {
        const allValid = isFormValid.username && 
                        isFormValid.email && 
                        isFormValid.phone && 
                        isFormValid.password && 
                        isFormValid.confirmPassword;
        
        submitButton.disabled = !allValid;
        
        if (allValid) {
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
            submitButton.style.backgroundColor = '#FAA628';
            submitButton.style.cursor = 'pointer';
        } else {
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            submitButton.style.backgroundColor = '#D1D5DB';
            submitButton.style.cursor = 'not-allowed';
        }
    }

    // ============================================
    // IMPLEMENTAÇÃO 100% SUPABASE (SEM LOCALSTORAGE)
    // ============================================
    let isSubmitting = false;

    // SOBRESCREVER A FUNÇÃO ONSYBMIT
    window.onsubmit = async function(token) {
        // Prevenir múltiplos envios
        if(isSubmitting) {
            console.log("Submissão já em andamento...");
            return;
        }

        // Validar elementos
        if(!emailInput || !passwordInput || !confirmPasswordInput || !result) {
            alert('Erro ao carregar o formulário.');
            return;
        }

        // Obter valores
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const username = usernameInput ? usernameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';

        // Validações finais
        if (!email || !password || !confirmPassword || !username) {
            result.style.color = "red";
            result.textContent = "❌ Preencha todos os campos!";
            return;
        }

        if (password !== confirmPassword) {
            result.style.color = "red";
            result.textContent = "❌ As senhas não conferem!";
            return;
        }

        if (password.length < 8) {
            result.style.color = "red";
            result.textContent = "❌ A senha deve ter pelo menos 8 caracteres!";
            return;
        }

        // Marcar como enviando
        isSubmitting = true;
        result.style.color = "black";
        result.textContent = "🔄 Criando sua conta no Supabase...";

        try {
            // ===== OPÇÃO 1: USAR A API DO BACKEND (RECOMENDADO) =====
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    confirm_password: confirmPassword,
                    username: username,
                    phone: phone,
                    recaptchaToken: token
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log("✅ Usuário criado no Supabase:", data);
                
                result.style.color = "green";
                result.textContent = "✅ Conta criada! Verifique seu email.";

                // Opcional: salvar apenas email no localStorage para lembrar
                localStorage.setItem('last_email', email);

                // Redirecionar para login
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 2000);
            } else {
                // Erro retornado pela API
                result.style.color = "red";
                result.textContent = `❌ ${data.error || 'Erro ao criar conta'}`;
                isSubmitting = false;
            }

            // ===== OPÇÃO 2: USAR SUPABASE DIRETO (ALTERNATIVA) =====
            /*
            if (!supabase) {
                throw new Error("Supabase não configurado");
            }

            // Criar usuário diretamente no Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username,
                        phone: phone
                    }
                }
            });

            if (authError) {
                throw authError;
            }

            console.log("✅ Usuário criado:", authData);
            
            result.style.color = "green";
            result.textContent = "✅ Conta criada! Verifique seu email.";
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
            */

        } catch (error) {
            console.error("❌ Erro detalhado:", error);
            
            let mensagemErro = "❌ Erro ao criar conta";
            
            if (error.message) {
                if (error.message.includes("User already registered")) {
                    mensagemErro = "❌ Este email já está cadastrado";
                } else if (error.message.includes("network")) {
                    mensagemErro = "❌ Erro de conexão";
                } else {
                    mensagemErro = `❌ ${error.message}`;
                }
            }
            
            result.style.color = "red";
            result.textContent = mensagemErro;
            isSubmitting = false;
        }
    };

    // Evento de clique do botão (MANTIDO IGUAL)
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        if (submitButton.disabled) {
            return;
        }
        
        if (typeof grecaptcha !== 'undefined' && grecaptcha) {
            grecaptcha.ready(function() {
                grecaptcha.execute('6LctSXksAAAAAM19sUp0Z0wRZ7nAMIxlLGe7EDgf', {action: 'submit'}).then(function(token) {
                    window.onsubmit(token);
                });
            });
        } else {
            console.warn("reCAPTCHA não carregado");
            window.onsubmit('no-token');
        }
    });

    // Prevenir submissão padrão
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
        });
    }

    // Validação inicial
    setTimeout(() => {
        if (usernameInput) usernameInput.dispatchEvent(new Event('input'));
        if (emailInput) emailInput.dispatchEvent(new Event('input'));
        if (phoneInput) phoneInput.dispatchEvent(new Event('input'));
        if (passwordInput) passwordInput.dispatchEvent(new Event('input'));
        if (confirmPasswordInput) confirmPasswordInput.dispatchEvent(new Event('input'));
    }, 100);
});