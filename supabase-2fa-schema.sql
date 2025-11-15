-- Two-Factor Authentication Schema
-- Run this in your Supabase SQL editor

-- 2FA Table
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Array of hashed backup codes
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own 2FA settings
CREATE POLICY "Users manage own 2FA"
  ON public.user_2fa
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);

-- Audit log for 2FA events (optional but recommended)
CREATE TABLE IF NOT EXISTS public.user_2fa_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'setup', 'verify', 'login', 'disable', 'backup_used'
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.user_2fa_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users view own 2FA audit logs"
  ON public.user_2fa_audit
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for audit logs
CREATE INDEX IF NOT EXISTS idx_user_2fa_audit_user_id ON public.user_2fa_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_audit_created_at ON public.user_2fa_audit(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_user_2fa_updated_at 
  BEFORE UPDATE ON public.user_2fa 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trusted Devices Table (for "Remember this device" feature)
CREATE TABLE IF NOT EXISTS public.user_trusted_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL, -- Browser fingerprint
  device_name TEXT, -- User-friendly name (e.g., "Chrome on MacBook")
  ip_address INET,
  user_agent TEXT,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- Typically 30 days from creation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS on trusted devices
ALTER TABLE public.user_trusted_devices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and delete their own trusted devices
CREATE POLICY "Users manage own trusted devices"
  ON public.user_trusted_devices
  FOR ALL
  USING (auth.uid() = user_id);

-- Index for trusted devices
CREATE INDEX IF NOT EXISTS idx_user_trusted_devices_user_id ON public.user_trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trusted_devices_expires_at ON public.user_trusted_devices(expires_at);

-- Function to clean up expired trusted devices
CREATE OR REPLACE FUNCTION cleanup_expired_trusted_devices()
RETURNS void AS $$
BEGIN
  DELETE FROM public.user_trusted_devices
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can run this periodically with pg_cron or manually
-- SELECT cleanup_expired_trusted_devices();
