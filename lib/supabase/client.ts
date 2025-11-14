import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Export function to create client (browser)
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  preferred_language: 'de' | 'en';
  preferred_currency: string;
  preferred_timezone: string;
  preferred_date_format: string;
  created_at: string;
  updated_at: string;
}

export interface Automation {
  id: string;
  user_id: string;
  name: string;
  description: string;
  workflow_config: any;
  status: 'active' | 'paused' | 'error' | 'draft';
  last_run_at: string | null;
  total_runs: number;
  created_at: string;
  updated_at: string;
}

export interface ExtractedDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  document_type: 'invoice' | 'receipt' | 'contract' | 'other';
  extracted_data: any;
  document_language: 'de' | 'en' | 'other';
  user_language: 'de' | 'en';
  confidence_score: number;
  created_at: string;
}
