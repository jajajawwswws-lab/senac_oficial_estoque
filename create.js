// create_account.js - VERSÃO LIMPA (SEM reCAPTCHA)

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
        
        if (username.length < 5) {
            showFieldError(this, 'Username must be at least 5 characters');
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
        if (phoneDigits.length >= 10) {
            isFormValid.phone = true;
        } else {
            isFormValid.phone = false;
        }
        updateSubmitButton();
    });

    // Validação de senha
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        if (passwordStrengthDiv) passwordStrengthDiv.classList.remove('hidden');
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

    confirmPasswordInput.addEventListener('input', function() {
        checkPasswordMatch();
        updateSubmitButton();
    });

    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (!confirmPassword) {
            if (passwordMatchMessage) passwordMatchMessage.innerHTML = '';
            confirmPasswordInput.style.borderColor = '';
            isFormValid.confirmPassword = false;
            return;
        }
        if (password === confirmPassword) {
            if (passwordMatchMessage) passwordMatchMessage.innerHTML = '<span class="text-green-600">✓ Passwords match</span>';
            confirmPasswordInput.style.borderColor = '#10B981';
            isFormValid.confirmPassword = true;
        } else {
            if (passwordMatchMessage) passwordMatchMessage.innerHTML = '<span class="text-red-600">✗ Passwords do not match</span>';
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
        return Math.min(Math.max(score, 1), 5);
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
        if (errorDiv) errorDiv.remove();
    }

    function updateSubmitButton() {
        const allValid = isFormValid.username && isFormValid.email && isFormValid.password && isFormValid.confirmPassword;
        submitButton.disabled = !allValid;
        if (allValid) {
            submitButton.classList.add('bg-orange-400', 'hover:bg-orange-500', 'cursor-pointer');
            submitButton.classList.remove('bg-gray-300', 'cursor-not-allowed');
            submitButton.style.backgroundColor = '#FAA628';
        } else {
            submitButton.classList.add('bg-gray-300', 'cursor-not-allowed');
            submitButton.classList.remove('bg-orange-400', 'hover:bg-orange-500', 'cursor-pointer');
            submitButton.style.backgroundColor = '#D1D5DB';
        }
    }

    // ENVIO DO FORMULÁRIO
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!submitButton.disabled) {
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Creating account...';
            submitButton.style.backgroundColor = '#9CA3AF';
            
            try {
                // Montar JSON do formulário
                const payload = {
                    username: usernameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    password: passwordInput.value.trim(),
                    confirmPassword: confirmPasswordInput.value.trim()
                };
                
                // Enviar para o backend
                const respostaBackend = await fetch("/api/crtback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const resultado = await respostaBackend.json();

                if (!resultado.success) {
                    alert("❌ Erro: " + (resultado.error || "Algo deu errado"));
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                    updateSubmitButton();
                    return;
                }
                
                // Sucesso!
                alert("✅ Conta criada com sucesso!");
                form.reset();
                window.location.href = "index.html";
                
            } catch (error) {
                console.error('Erro:', error);
                alert('❌ Erro ao criar conta. Tente novamente.');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                updateSubmitButton();
            }
        } else {
            alert('Please fill all required fields correctly.');
        }
    });

    // Validação inicial silenciosa
    setTimeout(() => {
        usernameInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        passwordInput.dispatchEvent(new Event('input'));
        confirmPasswordInput.dispatchEvent(new Event('input'));
    }, 100);
});
