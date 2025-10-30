import { createClient } from '@supabase/supabase-js';

// Guard para evitar errores durante el build si las env vars no están disponibles
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Solo crear el cliente si tenemos las credenciales necesarias
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

// Cliente para operaciones server-side con service role
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceKey || !supabaseUrl) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL must be set');
  }
  
  return createClient(supabaseUrl, serviceKey);
};
