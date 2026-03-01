import { createClient } from '@supabase/supabase-js'

// Cliente Supabase
const supabaseUrl = process.env['SUPABASE_URL']!
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Handler sem tipos complexos (usando any)
export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Content-Type', 'application/json')

  // OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // GET - Teste
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'API de autenticação funcionando!',
      timestamp: new Date().toISOString(),
      env: {
        url: !!process.env['SUPABASE_URL'],
        key: !!process.env['SUPABASE_SERVICE_ROLE_KEY']
      }
    })
  }

  // POST - Login/Cadastro
  if (req.method === 'POST') {
    try {
      const { email, password, action } = req.body

      if (!email || !password || !action) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: email, password, action'
        })
      }

      // Verificar variáveis de ambiente
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({
          success: false,
          error: 'Erro de configuração do servidor'
        })
      }

      // CADASTRO
      if (action === 'signup') {
        const { data, error } = await supabaseAdmin.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${req.headers.origin || 'http://localhost:3000'}/welcome`
          }
        })

        if (error) {
          return res.status(400).json({
            success: false,
            error: error.message
          })
        }

        return res.status(201).json({
          success: true,
          message: 'Usuário criado! Verifique seu email.',
          user: {
            id: data.user?.id,
            email: data.user?.email
          }
        })
      }

      // LOGIN
      if (action === 'signin') {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          return res.status(401).json({
            success: false,
            error: error.message.includes('Invalid login') 
              ? 'Email ou senha incorretos' 
              : error.message
          })
        }

        return res.status(200).json({
          success: true,
          message: 'Login realizado!',
          session: {
            access_token: data.session?.access_token,
            expires_at: data.session?.expires_at
          },
          user: {
            id: data.user?.id,
            email: data.user?.email
          }
        })
      }

      return res.status(400).json({
        success: false,
        error: 'Ação inválida. Use: signup ou signin'
      })

    } catch (error: any) {
      console.error('Erro:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro interno',
        details: error.message
      })
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Método não permitido'
  })
}