
        // Senha correta (em um sistema real, isso seria verificado no servidor)
        const SENHA_CORRETA = 'senha123';
        
        // Elementos DOM
        const passwordBox = document.getElementById('password-box');
        const submitBtn = document.getElementById('submit-btn');
        const successMessage = document.getElementById('success-message');
        
        // Alternar visibilidade da caixa de senha
        function togglePasswordBox() {
            const isHidden = passwordBox.classList.contains('hidden');
            
            if (isHidden) {
                passwordBox.classList.remove('hidden');
                // Focar no primeiro campo
                setTimeout(() => {
                    document.getElementById('current-password').focus();
                }, 100);
            } else {
                passwordBox.classList.add('hidden');
                resetForm();
            }
        }
        
        // Alternar visibilidade da senha
        function togglePasswordVisibility(fieldId) {
            const field = document.getElementById(fieldId);
            const icon = field.parentNode.querySelector('i');
            
            if (field.type === 'password') {
                field.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                field.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
        
        // Atualizar contador de caracteres e força da senha
        function updatePasswordStrength() {
            const newPassword = document.getElementById('new-password');
            const charCount = document.getElementById('char-count');
            const charValidation = document.getElementById('char-validation');
            const strengthBar = document.getElementById('password-strength-bar');
            const strengthText = document.getElementById('password-strength-text');
            
            const length = newPassword.value.length;
            charCount.textContent = `${length}/13 caracteres`;
            
            // Validar comprimento mínimo
            if (length < 13) {
                charValidation.classList.remove('hidden');
                newPassword.classList.add('error-input');
                newPassword.classList.remove('success-input');
                submitBtn.disabled = true;
            } else {
                charValidation.classList.add('hidden');
                newPassword.classList.remove('error-input');
                newPassword.classList.add('success-input');
            }
            
            // Calcular força da senha
            let strength = 0;
            let color = '#ef4444'; // Vermelho
            let text = 'Fraca';
            
            if (length >= 13) strength += 25;
            if (/[A-Z]/.test(newPassword.value)) strength += 25;
            if (/[0-9]/.test(newPassword.value)) strength += 25;
            if (/[^A-Za-z0-9]/.test(newPassword.value)) strength += 25;
            
            // Definir cor e texto baseado na força
            if (strength >= 75) {
                color = '#10b981'; // Verde
                text = 'Forte';
            } else if (strength >= 50) {
                color = '#f59e0b'; // Amarelo
                text = 'Média';
            } else if (strength >= 25) {
                color = '#f97316'; // Laranja
                text = 'Fraca';
            }
            
            // Atualizar barra de força
            strengthBar.style.width = `${strength}%`;
            strengthBar.style.backgroundColor = color;
            strengthText.textContent = text;
            strengthText.style.color = color;
            
            // Verificar se pode habilitar o botão
            checkFormValidity();
        }
        
        // Verificar se as senhas coincidem
        function checkPasswordMatch() {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const matchError = document.getElementById('password-match-error');
            const matchSuccess = document.getElementById('password-match-success');
            const confirmField = document.getElementById('confirm-password');
            
            if (confirmPassword === '') {
                matchError.classList.add('hidden');
                matchSuccess.classList.add('hidden');
                confirmField.classList.remove('error-input', 'success-input');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                matchError.classList.remove('hidden');
                matchSuccess.classList.add('hidden');
                confirmField.classList.add('error-input');
                confirmField.classList.remove('success-input');
            } else {
                matchError.classList.add('hidden');
                matchSuccess.classList.remove('hidden');
                confirmField.classList.remove('error-input');
                confirmField.classList.add('success-input');
            }
            
            checkFormValidity();
        }
        
        // Verificar validade geral do formulário
        function checkFormValidity() {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Habilitar botão apenas se:
            // 1. Todos os campos estão preenchidos
            // 2. Nova senha tem pelo menos 13 caracteres
            // 3. As senhas novas coincidem
            const isValid = currentPassword && 
                           newPassword.length >= 13 && 
                           newPassword === confirmPassword;
            
            submitBtn.disabled = !isValid;
        }
        
        // Resetar formulário
        function resetForm() {
            document.getElementById('password-form').reset();
            document.getElementById('current-password-error').classList.add('hidden');
            document.getElementById('password-match-error').classList.add('hidden');
            document.getElementById('password-match-success').classList.add('hidden');
            successMessage.classList.add('hidden');
            
            // Resetar estilos
            const inputs = ['current-password', 'new-password', 'confirm-password'];
            inputs.forEach(id => {
                const input = document.getElementById(id);
                input.classList.remove('error-input', 'success-input');
                input.type = 'password';
                
                // Resetar ícones de olho
                const icon = input.parentNode.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
            
            // Resetar contador e força
            document.getElementById('char-count').textContent = '0/13 caracteres';
            document.getElementById('char-validation').classList.add('hidden');
            document.getElementById('password-strength-bar').style.width = '0%';
            document.getElementById('password-strength-text').textContent = '';
            
            submitBtn.disabled = true;
        }
        
        // Função principal para alterar senha
        function alterarSenha(event) {
            event.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const currentPasswordError = document.getElementById('current-password-error');
            const currentPasswordField = document.getElementById('current-password');
            
            // Verificar senha atual (simulação)
            if (currentPassword !== SENHA_CORRETA) {
                currentPasswordError.classList.remove('hidden');
                currentPasswordField.classList.add('error-input');
                currentPasswordField.focus();
                return false;
            }
            
            // Em uma aplicação real, aqui você faria uma requisição AJAX para o servidor
            // Exemplo:
            /*
            fetch('/api/alterar-senha', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    senhaAtual: currentPassword,
                    novaSenha: newPassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showSuccessMessage();
                    resetForm();
                } else {
                    alert('Erro: ' + data.message);
                }
            });
            */
            
            // Simulação de sucesso
            showSuccessMessage();
            
            // Resetar após 3 segundos
            setTimeout(() => {
                resetForm();
                togglePasswordBox();
            }, 3000);
            
            return false;
        }
        
        // Mostrar mensagem de sucesso
        function showSuccessMessage() {
            successMessage.classList.remove('hidden');
            document.getElementById('password-form').classList.add('hidden');
        }
        
        // Fechar ao pressionar ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && !passwordBox.classList.contains('hidden')) {
                togglePasswordBox();
            }
        });
        
        // Fechar ao clicar fora (opcional)
        document.addEventListener('click', function(event) {
            const isClickInside = passwordBox.contains(event.target) || 
                                 document.getElementById('btn-alterar-senha').contains(event.target);
            
            if (!isClickInside && !passwordBox.classList.contains('hidden')) {
                togglePasswordBox();
            }
        });