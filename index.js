// ===============================
// Validação de campos
// ===============================
function validarCampos(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        alert("Digite um e-mail válido.");
        return false;
    }

    if (password.length < 9) {
        alert("A senha deve conter pelo menos 9 caracteres.");
        return false;
    }

    return true;
}

// ===============================
// Callback chamado pelo reCAPTCHA
// ===============================
let isSubmitting = false;

window.onSubmit = function(token) {
    // Prevent multiple submissions
    if (isSubmitting) {
        console.log('Submission already in progress');
        return;
    }
    
    // Get DOM elements with null checks
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resultado = document.getElementById('resultado');
    
    if (!emailInput || !passwordInput || !resultado) {
        console.error('Required form elements not found');
        alert('Erro ao carregar o formulário');
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate before sending
    if (!validarCampos(email, password)) {
        return;
    }

    // Set submitting flag
    isSubmitting = true;
    
    resultado.style.color = "black";
    resultado.textContent = "🔄 Verificando...";

    // Send to backend
    fetch('/api/backend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            password: password,
            recaptchaToken: token
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || `Erro HTTP: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log("Resposta do backend:", data);

        if (data.success) {
            resultado.style.color = "green";
            resultado.textContent = "✅ Login realizado com sucesso!";

            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = "account.html";
            }, 1000);
        } else {
            resultado.style.color = "red";
            resultado.textContent = data.error || "E-mail ou senha incorretos!";
            isSubmitting = false; // Reset flag on failure
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        resultado.style.color = "red";
        resultado.textContent = "❌ Erro de conexão com o servidor.";
        isSubmitting = false; // Reset flag on error
    });
};

// ===============================
// Impedir envio padrão do formulário
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            // The reCAPTCHA will call onSubmit automatically
        });
    } else {
        console.error('Login form not found');
    }
});
