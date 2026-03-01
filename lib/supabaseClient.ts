import { createClient } from '@supabase/supabase-js'

// Verificar variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL não definida')
if (!supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY não definida')
if (!supabaseServiceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')

// Cliente para frontend (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente para backend (service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
