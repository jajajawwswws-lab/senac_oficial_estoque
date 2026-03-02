// create.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

console.info('✅ create.js iniciado com Supabase');

// Certifique-se de que as variáveis públicas foram definidas no HTML
if (typeof SUPABASE_URL === 'https://fbbkshvhbfgdopsgtlxi.supabase.co' || typeof SUPABASE_ANON_KEY === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiYmtzaHZoYmZnZG9wc2d0bHhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NzM2MjksImV4cCI6MjA4NzQ0OTYyOX0.kP9aNo2u5xCiThFf0g6SHttnPV9HqvqBmremeG28H0Q') {
  throw new Error('SUPABASE_URL ou SUPABASE_ANON_KEY não definidos. Defina-os no HTML antes de carregar create.js');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Seletores do seu formulário (ajuste se necessário)
const form = document.querySelector('#registrationForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const usernameInput = document.querySelector('#username');
const phoneInput = document.querySelector('#phone');
const submitButton = document.querySelector('#submitButton');
const resultBox = document.querySelector('#result');

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
  submitButton.innerHTML = loading ? '<span class="spinner"></span>Processing...' : 'Create your Estoque Senac account';
}

// Validações simples (ajuste conforme necessidade)
function validateEmail() {
  const val = (emailInput?.value || '').trim();
  return /\S+@\S+\.\S+/.test(val);
}
function validatePassword() {
  const val = passwordInput?.value || '';
  return val.length >= 8;
}
function validateUsername() {
  const val = (usernameInput?.value || '').trim();
  return val.length >= 3;
}
function validatePhone() {
  const val = (phoneInput?.value || '').trim();
  return val.length > 0;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!form) return;

  // simples revalidação
  if (!validateEmail() || !validatePassword() || !validateUsername() || !validatePhone()) {
    showResult('Please fill all fields correctly', false);
    return;
  }

  setLoading(true);
  showResult('Creating your account...', true);

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();
  const phone = phoneInput.value.trim();

  try {
    // 1) Cadastrar usuário no Supabase Auth (cliente) — usa anon key
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    }, {
      data: { username, phone } // metadados que ficam no perfil do usuário
    });

    if (signUpError) {
      console.error('SignUp error:', signUpError);
      showResult(signUpError.message || 'Registration failed', false);
      setLoading(false);
      return;
    }

    // Se o projeto requer confirmação por email, o usuário receberá o link.
    // signUpData.user indica o usuário criado.
    console.log('signUpData', signUpData);

    // 2) Opcional: criar perfil na tabela "profiles" (recomendado) — usando anon key,
    // mas lembre-se: a tabela profiles deve ter políticas RLS que permitam inserts por users.
    // Se preferir criação via backend (service_role), mova isso para um endpoint seguro.
    const user = signUpData.user;
    if (user) {
      const profile = {
        id: user.id,           // assumir que profiles.id é uuid do auth
        email: user.email,
        username,
        phone,
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profile, { returning: 'minimal' }); // upsert útil para evitar duplicados

      if (profileError) {
        console.warn('Profile upsert warning/error:', profileError);
        // Não falhar completamente — pode ser ajustado conforme sua RLS/policies
      } else {
        console.log('Profile upserted:', profileData);
      }
    }

    showResult('Account created! Check your email to confirm (if required).', true);
    setTimeout(() => window.location.href = 'index.html', 1800);
  } catch (err) {
    console.error('Registration unexpected error', err);
    showResult('Connection error. Please try again.', false);
  } finally {
    setLoading(false);
  }
}

if (form) {
  form.addEventListener('submit', handleSubmit);
} else {
  console.warn('Form #registrationForm não encontrado — ajuste o seletor no create.js');
}

