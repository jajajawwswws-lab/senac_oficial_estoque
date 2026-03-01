import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Inicializar cliente Supabase diretamente (sem arquivo externo para evitar erros)
const supabaseUrl = process.env['SUPABASE_URL']
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas:', {
    url: !!supabaseUrl,
    key: !!supabaseServiceKey
  })
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Responder preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET - Rota de teste
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'API de autenticação funcionando!',
      timestamp: new Date().toISOString(),
      env: {
        supabaseUrl: !!process.env['SUPABASE_URL'],
        supabaseKey: !!process.env['SUPABASE_SERVICE_ROLE_KEY']
      }
    })
  }

  // POST - Login/Cadastro
  if (req.method === 'POST') {
    try {
      const { email, password, action } = req.body

      // Validar campos obrigatórios
      if (!email || !password || !action) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatórios: email, password, action'
        })
      }

      console.log(`📝 Ação: ${action} - Email: ${email}`)

      // Verificar se as variáveis de ambiente estão configuradas
      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({
          success: false,
          error: 'Erro de configuração do servidor',
          details: 'Variáveis de ambiente do Supabase não configuradas'
        })
      }

      // CADASTRO (signup)
      if (action === 'signup') {
        const { data, error } = await supabaseAdmin.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${req.headers.origin || 'http://localhost:3000'}/welcome`
          }
        })

        if (error) {
          console.error('❌ Erro no signup:', error)
          return res.status(400).json({
            success: false,
            error: error.message
          })
        }

        console.log('✅ Usuário criado:', data.user?.id)

        return res.status(201).json({
          success: true,
          message: 'Usuário criado com sucesso! Verifique seu email.',
          user: {
            id: data.user?.id,
            email: data.user?.email
          }
        })
      }

      // LOGIN (signin)
      if (action === 'signin') {
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          console.error('❌ Erro no login:', error)
          
          // Mensagens de erro amigáveis
          if (error.message.includes('Invalid login credentials')) {
            return res.status(401).json({
              success: false,
              error: 'Email ou senha incorretos'
            })
          }
          
          return res.status(400).json({
            success: false,
            error: error.message
          })
        }

        console.log('✅ Login realizado:', data.user?.id)

        return res.status(200).json({
          success: true,
          message: 'Login realizado com sucesso!',
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

      // Ação inválida
      return res.status(400).json({
        success: false,
        error: 'Ação inválida. Use: signup ou signin'
      })

    } catch (error: any) {
      console.error('❌ Erro interno:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message
      })
    }
  }

  // Método não permitido
  return res.status(405).json({
    success: false,
    error: 'Método não permitido'
  })
}
