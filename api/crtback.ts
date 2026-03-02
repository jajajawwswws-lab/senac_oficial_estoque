import { IncomingMessage, ServerResponse } from "node:http";
import { addUser, userExists, User } from "./users.js";
///import bcrypt from "bcrypt"; // npm install bcrypt

interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  username?: string;
  phone?: string;
  recaptchaToken: string;
}

interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

async function readRequestBody(req: IncomingMessage): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
}

async function ServerRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  // CORS + content-type
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.statusCode = 200;
    response.end();
    return;
  }

  if (request.method !== "POST") {
    response.statusCode = 405;
    response.end(
      JSON.stringify({ success: false, error: "Método não permitido" })
    );
    return;
  }

  try {
    const rawBody = await readRequestBody(request);
    const data: RegisterRequest = JSON.parse(rawBody || "{}");
    const { email, password, confirm_password, username, phone, recaptchaToken } = data;

    console.log("📝 Body recebido (registro):", { email, username, phone });

    // Validações básicas
    if (!email || !password || !confirm_password || !recaptchaToken) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({ success: false, error: "Campos obrigatórios não preenchidos" })
      );
      return;
    }

    if (password !== confirm_password) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          success: false,
          error: "As senhas não conferem",
          field: "confirm_password",
        })
      );
      return;
    }

    // Verifica se o usuário existe (assumi função async)
    const exists = await userExists(email);
    if (exists) {
      response.statusCode = 409;
      response.end(
        JSON.stringify({
          success: false,
          error: "Este email já está cadastrado",
          field: "email",
        })
      );
      return;
    }

    // Verificar reCAPTCHA (usar segredo via variável de ambiente)
    const RECAPTCHA_SECRET = process.env["RECAPTCHA_SECRET"];
    if (!RECAPTCHA_SECRET) {
      console.warn("RECAPTCHA_SECRET não definido no ambiente");
    }

    const verifyResp = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: RECAPTCHA_SECRET || "no-secret-provided",
          response: recaptchaToken,
        }).toString(),
      }
    );

    const verifyDataAPI = await verifyResp.json() as RecaptchaResponse;
    console.log("🤖 Resposta Google reCAPTCHA:", verifyDataAPI);

    // O campo de sucesso é verifyDataAPI.success
    if (!verifyDataAPI || !verifyDataAPI.success) {
      response.statusCode = 400;
      response.end(
        JSON.stringify({
          success: false,
          error: "reCAPTCHA inválido",
          field: "recaptcha",
        })
      );
      return;
    }

    // Hashear a senha antes de salvar
    const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const novoUsuario: User = {
      email,
      password: hashedPassword,
      username: username || "",
      phone: phone || "",
      createdAt: new Date(),
    };

    await addUser(novoUsuario); // assumi async

    // Se você mantém um array global, garanta que exista
    if (!globalThis.users) (globalThis as any).users = [];
    console.log(`✅ USUÁRIO CRIADO: ${email}`);
    console.log(`📋 Total: ${(globalThis as any).users.length}`);
    console.log("📋 Usuários:", ((globalThis as any).users || []).map((u: any) => u.email));

    response.statusCode = 200;
    response.end(
      JSON.stringify({
        success: true,
        message: "Conta criada com sucesso!",
        data: { email, username },
      })
    );
  } catch (error) {
    console.error("❌ Erro no backend (registro):", error);
    response.statusCode = 500;
    response.end(JSON.stringify({ success: false, error: "Erro interno do servidor" }));
  }
}

export default ServerRequest;