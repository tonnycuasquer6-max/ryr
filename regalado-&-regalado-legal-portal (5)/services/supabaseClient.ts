
import { createClient } from '@supabase/supabase-js';

// The Supabase URL is constructed from your project ID.
const supabaseUrl = 'https://esolamojbxosnwqbtmbe.supabase.co';

// This is the public API key for your project.
const supabaseAnonKey = 'sb_publishable_zY7uEsSMSw-JMorX5KCBWw_A05KsnFa';

// Initialize the Supabase client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
