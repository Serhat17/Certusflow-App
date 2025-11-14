import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client for API routes - reads all Supabase cookies
export async function createServerClient() {
  const cookieStore = await cookies();
  
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Pass all cookies as a single header string
        cookie: cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
      }
    }
  });
  
  return client;
}
