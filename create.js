import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
// Criação do cliente Supabase
const supabase = createClient(
  'https://vercel_icfg_zw4SbRdBbh4Wc6N5T8IK5Ybk.supabase.co', 
  'sb_publishable_LYvjTbiU5JDe6zYCWnPWVg_4Vkdf2q0'
);
/*async function login(email, password) { const { user, error } = await supabase.auth.signInWithPassword({ email: email, password: password, }); if (error) { console.error('Erro de login:', error.message); } else { console.log('Usuário logado:', user); } }*/
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

    // Validação em tempo real
    let isFormValid = {
        username: false,
        email: false,
        phone: false,
        password: false,
        confirmPassword: false
    };

    // Toggle de visibilidade da senha
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

    // Validação de username
    usernameInput.addEventListener('input', function() {
        const username = this.value.trim();
        const pattern = /^[a-zA-Z0-9_]+$/;
        
        if (username.length < 3) {
            showFieldError(this, 'Username must be at least 3 characters');
            isFormValid.username = false;
        } else if (username.length > 30) {
            showFieldError(this, 'Username cannot exceed 30 characters');
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

    // Validação de email
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
    
    // Validação de telefone
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
        
        // Validar DDDs brasileiros válidos
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

    // Validação de força da senha
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

    // Validação de confirmação de senha
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

    // Cálculo da força da senha
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let score = 0;
        
        // Comprimento
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Complexidade
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;
        
        // Ajustar para escala de 1-5
        return Math.min(Math.max(Math.floor(score / 2) + 1, 1), 5);
    }

    // Atualiza o indicador de força da senha
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

    // Exibe mensagens de erro para o campo
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

    // Atualiza o botão de submissão
    function updateSubmitButton() {
        const allValid = isFormValid.username && 
                        isFormValid.email && 
                        isFormValid.phone && // Incluir phone na validação
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

    // Função de validação de campos
    function validarCampos(email, password, confirmPassword) {
        if (!email || !password || !confirmPassword) {
            if (result) {
                result.style.color = "red";
                result.textContent = "❌ Todos os campos são obrigatórios!";
            }
            return false;
        }
        if (password !== confirmPassword) {
            if (result) {
                result.style.color = "red";
                result.textContent = "❌ As senhas não coincidem!";
            }
            return false;
        }
        return true;
    }

    // Variável de controle para evitar múltiplos envios
    let isSubmitting = false;

    // Função que será chamada no submit
    window.onSubmit = function(token) {
        // Prevenir múltiplos envios
        if(isSubmitting) {
            console.log("Submissão já em andamento...");
            return;
        }

        // Validar elementos necessários
        if(!emailInput || !passwordInput || !confirmPasswordInput || !result) {
            console.error('Elementos do formulário não encontrados');
            alert('Erro ao carregar o formulário. Elementos não encontrados.');
            return;
        }

        // Obter valores
        const gmail = emailInput.value.trim();
        const pass_word = passwordInput.value.trim();
        const require_pass_word = confirmPasswordInput.value.trim();

        // Validar campos
        if(!validarCampos(gmail, pass_word, require_pass_word)) {
            return;
        }

        // Marcar como enviando
        isSubmitting = true;
        
        // Mostrar mensagem de carregamento
        result.style.color = "black";
        result.textContent = "🔄 Verificando conta...";

        // Criar conta com Supabase
        supabase.auth.signUp({
            email: gmail,
            password: pass_word
        }).then(({ user, error }) => {
            if (error) {
                result.style.color = "red";
                result.textContent = "❌ Erro ao criar conta: " + error.message;
                isSubmitting = false;
            } else {
                result.style.color = "green";
                result.textContent = "✅ Conta criada com sucesso!";

                // Fazer login após o cadastro
                supabase.auth.signInWithPassword({
                    email: gmail,
                    password: pass_word
                }).then(({ user, error }) => {
                    if (error) {
                        result.style.color = "red";
                        result.textContent = "❌ Erro de login: " + error.message;
                    } else {
                        console.log("Usuário logado:", user);
                        // Redirecionar após 1 segundo
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1000);
                    }
                });
            }
        });

    };

    // Adicionar evento de clique ao botão para executar reCAPTCHA
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();
        
        // Verificar se o botão está habilitado
        if (submitButton.disabled) {
            return;
        }
        
        // Executar reCAPTCHA
        grecaptcha.ready(function() {
            grecaptcha.execute('6LctSXksAAAAAM19sUp0Z0wRZ7nAMIxlLGe7EDgf', {action: 'submit'}).then(function(token) {
                // Chamar nossa função onSubmit com o token
                window.onSubmit(token);
            });
        });
    });

    // Prevenir submissão padrão do formulário
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
        });
    }

    // Validação inicial silenciosa após carregar a página
    setTimeout(() => {
        usernameInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        phoneInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }, 100);
});

