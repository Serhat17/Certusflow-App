import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server-side client for API routes - reads all Supabase cookies
export async function createServerClient() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Find the Supabase auth token cookie
  const authCookie = allCookies.find(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
  );
  
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // If we have an auth cookie, parse and set the session
  if (authCookie?.value) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(authCookie.value));
      if (sessionData.access_token && sessionData.refresh_token) {
        await client.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
      }
    } catch (e) {
      console.error('Failed to parse auth cookie:', e);
    }
  }
  
  return client;
}
