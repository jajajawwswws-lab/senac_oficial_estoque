form.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!submitButton.disabled) {
        // Desabilitar botão e mudar texto
        submitButton.disabled = true;
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating account...';
        submitButton.style.backgroundColor = '#9CA3AF';

        try {
            // Preparar payload JSON
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
                alert("❌ Erro: " + (resultado.error || "Não foi possível criar a conta"));
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                updateSubmitButton();
                return;
            }

            // Sucesso
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
        alert('Por favor, preencha todos os campos corretamente.');
    }
});
