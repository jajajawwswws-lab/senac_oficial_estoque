
import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env['SUPABASE_URL']!
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Responder preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    })
  }

  try {
    const { email, password, confirm_password, username, phone, recaptchaToken } = req.body

    // Validações
    if (!email || !password || !confirm_password || !recaptchaToken) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios não preenchidos'
      })
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: 'As senhas não conferem',
        field: 'confirm_password'
      })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Este email já está cadastrado',
        field: 'email'
      })
    }

    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          phone
        }
      }
    })

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      })
    }

    // Inserir na tabela users
    if (authData.user) {
      await supabaseAdmin
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            username: username || email.split('@')[0],
            phone: phone || null,
            created_at: new Date().toISOString()
          }
        ])
    }

    // Sucesso
    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso! Verifique seu email.',
      data: {
        email,
        username: username || email.split('@')[0],
        id: authData.user?.id
      }
    })

  } catch (error: any) {
    console.error('Erro no registro:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    })
  }
}