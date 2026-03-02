// create.js - Frontend integrado com backend /api/register
document.addEventListener('DOMContentLoaded', function () {
  console.log('✅ create.js - VERSÃO CORRIGIDA (com fetch para /api/register)');
  console.log('🔍 Verificando localStorage antigo...');

  // Limpar qualquer dado antigo que possa causar confusão (opcional)
  if (localStorage.getItem('users')) {
    console.warn('⚠️ Dados antigos encontrados no localStorage. Limpando...');
    localStorage.removeItem('users');
  }

  // --- ELEMENTOS DO DOM (ajuste os seletores conforme seu HTML) ---
  const form = document.querySelector('#register-form'); // ajuste se necessário
  const emailInput = document.querySelector('#email');
  const passwordInput = document.querySelector('#password');
  const usernameInput = document.querySelector('#username');
  const phoneInput = document.querySelector('#phone');
  const submitButton = document.querySelector('#submit-btn');
  const resultBox = document.querySelector('#result'); // elemento para mostrar mensagens (opcional)

  // Variáveis/flags de validação (implemente validateX funções conforme seu código)
  const isFormValid = {
    email: false,
    password: false,
    username: false,
    phone: false,
  };

  function showResult(message, success) {
    if (!resultBox) {
      alert(message);
      return;
    }
    resultBox.textContent = message;
    resultBox.style.color = success ? 'green' : 'red';
  }

  function setLoading(loading) {
    if (!submitButton) return;
    submitButton.disabled = loading;
    submitButton.textContent = loading ? 'Processing...' : 'Create account';
  }

  // Placeholder: implemente suas validações reais
  function validateEmail() {
    if (!emailInput) return;
    const val = (emailInput.value || '').trim();
    isFormValid.email = /\S+@\S+\.\S+/.test(val);
  }
  function validatePassword() {
    if (!passwordInput) return;
    const val = passwordInput.value || '';
    isFormValid.password = val.length >= 8;
  }
  function validateUsername() {
    if (!usernameInput) return;
    const val = (usernameInput.value || '').trim();
    isFormValid.username = val.length >= 3;
  }
  function validatePhone() {
    if (!phoneInput) return;
    const val = (phoneInput.value || '').trim();
    isFormValid.phone = val.length > 0;
  }
  function checkPasswordMatch() {
    // se tiver confirm password, implemente aqui
  }

  // Chamar validações iniciais (se necessário)
  setTimeout(() => {
    validateUsername();
    validateEmail();
    validatePhone();
    validatePassword();
    checkPasswordMatch();
  }, 100);

  // --- Função que envia para o servidor ---
  async function saveUserToServer(payload) {
    try {
      // ATENÇÃO: em desenvolvimento, ajuste para 'http://localhost:3000/api/register' se seu backend estiver em outra porta
      const resp = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      console.log('📥 Resposta do servidor:', { status: resp.status, ok: resp.ok, body: data });

      if (resp.ok) {
        return { ok: true, data };
      }

      return { ok: false, status: resp.status, error: data || { message: 'Erro desconhecido' } };
    } catch (e) {
      console.error('Erro de rede ao chamar /api/register', e);
      return { ok: false, error: { message: e.message || 'Network error' } };
    }
  }

  // --- Handler do submit ---
  async function handleSubmit(event) {
    event.preventDefault();
    if (!submitButton) return;

    // Evita múltiplos envios
    if (submitButton.disabled) return;

    // Revalidar campos
    validateUsername();
    validateEmail();
    validatePhone();
    validatePassword();
    checkPasswordMatch();

    const allValid = Object.values(isFormValid).every(v => v === true);
    if (!allValid) {
      showResult('Please fill all fields correctly', false);
      return;
    }

    setLoading(true);
    showResult('Creating your account...', true);

    try {
      // Obter token reCAPTCHA (opcional)
      let recaptchaToken = null;
      if (typeof grecaptcha !== 'undefined' && typeof RECAPTCHA_SITE_KEY !== 'undefined') {
        try {
          recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit' });
          console.log('✅ reCAPTCHA token obtido');
        } catch (recaptchaError) {
          console.warn('reCAPTCHA error:', recaptchaError);
        }
      }

      const userData = {
        email: (emailInput.value || '').trim(),
        password: passwordInput.value || '',
        username: (usernameInput.value || '').trim(),
        phone: (phoneInput.value || '').trim(),
        recaptchaToken,
      };

      console.log('📤 Enviando dados para /api/register (senha oculta):', {
        ...userData,
        password: '***'
      });

      const result = await saveUserToServer(userData);

      if (result.ok && (result.data?.success || result.data?.profile || result.data?.userId)) {
        const userId = result.data?.userId || result.data?.profile?.id || null;
        console.log('✅ USUÁRIO CRIADO NO SERVIDOR! ID:', userId);
        showResult('Account created successfully! Redirecting...', true);

        // Salvar informação mínima no localStorage (opcional)
        localStorage.setItem('last_registered_email', userData.email);

        // Redirecionar após curto delay
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        console.error('❌ Erro do servidor:', result.error || result.status);
        const message =
          (result.error && (result.error.error || result.error.message || JSON.stringify(result.error))) ||
          'Registration failed';
        showResult(message, false);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      showResult('Connection error. Please try again.', false);
      setLoading(false);
    }
  }

  // Attaching the submit handler
  if (form) {
    form.addEventListener('submit', handleSubmit);
  } else {
    console.warn('⚠️ Form element (#register-form) não encontrado. Ajuste o seletor no create.js');
  }
});
