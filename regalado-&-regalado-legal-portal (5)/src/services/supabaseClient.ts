// FIX: Added a triple-slash directive to include Vite client types. This resolves the "Property 'env' does not exist on type 'ImportMeta'" error by providing the necessary type definitions for import.meta.env.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Vite expone las variables de entorno prefijadas con "VITE_" al cliente.
// Esto evita exponer accidentalmente secretos del servidor.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificación en tiempo de ejecución para asegurar que las variables están definidas.
// Esto lanzará un error claro durante el despliegue si no se configuran en Vercel.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined as environment variables.');
}

// Initialize and export the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);