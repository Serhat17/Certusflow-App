-- =====================================================
-- CERTUSFLOW CONTRACT SCANNER - DATABASE SCHEMA
-- =====================================================
-- Version: 1.0
-- Datum: 2025-11-14
-- DSGVO-konform mit Auto-Deletion nach 30 Tagen
-- =====================================================

-- Contract Analyses Table
CREATE TABLE IF NOT EXISTS public.contract_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- File Info
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  
  -- Encrypted Analysis Result (JSON)
  encrypted_analysis TEXT NOT NULL,
  
  -- Quick Access Fields (unencrypted for filtering)
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level TEXT CHECK (risk_level IN ('niedrig', 'gering', 'mittel', 'hoch', 'sehr_hoch')),
  contract_type TEXT,
  is_gdpr_compliant BOOLEAN,
  
  -- Auto-Deletion
  auto_delete_at TIMESTAMPTZ NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contract_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own analyses
CREATE POLICY "Users access own analyses"
  ON public.contract_analyses
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_contract_analyses_user_id ON public.contract_analyses(user_id);
CREATE INDEX idx_contract_analyses_auto_delete ON public.contract_analyses(auto_delete_at);
CREATE INDEX idx_contract_analyses_created_at ON public.contract_analyses(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contract_analyses_updated_at
  BEFORE UPDATE ON public.contract_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AUTO-DELETE CRON JOB (runs daily at 3 AM)
-- =====================================================
-- Note: Requires pg_cron extension
-- Enable in Supabase: Database → Extensions → pg_cron

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule old job if exists (for re-runs)
SELECT cron.unschedule('delete-old-contract-analyses') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'delete-old-contract-analyses'
);

-- Schedule the auto-delete job
SELECT cron.schedule(
  'delete-old-contract-analyses',
  '0 3 * * *', -- Every day at 3:00 AM
  $$
  DELETE FROM public.contract_analyses
  WHERE auto_delete_at < NOW();
  $$
);

-- =====================================================
-- AUDIT LOG ENHANCEMENT
-- =====================================================
-- Ensure audit_log table exists (from earlier implementation)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own audit logs
CREATE POLICY "Users view own audit logs"
  ON public.audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service Role can insert audit logs
CREATE POLICY "Service role inserts audit logs"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (true);

-- Index for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_type ON public.audit_log(action_type);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the schema is created correctly:

-- Check table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'contract_analyses';

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'contract_analyses';

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'contract_analyses';

-- Check cron job
-- SELECT * FROM cron.job WHERE jobname = 'delete-old-contract-analyses';

-- =====================================================
-- SAMPLE QUERIES
-- =====================================================

-- Get all analyses for current user
-- SELECT id, file_name, risk_score, risk_level, contract_type, created_at, auto_delete_at
-- FROM contract_analyses
-- WHERE user_id = auth.uid()
-- ORDER BY created_at DESC;

-- Get high-risk contracts
-- SELECT * FROM contract_analyses
-- WHERE user_id = auth.uid() AND risk_level IN ('hoch', 'sehr_hoch')
-- ORDER BY risk_score DESC;

-- Count analyses by type
-- SELECT contract_type, COUNT(*) as count
-- FROM contract_analyses
-- WHERE user_id = auth.uid()
-- GROUP BY contract_type;
