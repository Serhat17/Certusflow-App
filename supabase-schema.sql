-- =====================================================
-- CertusFlow - Database Schema
-- Version: 5.0 - Multilingual Edition
-- Author: Serhat17
-- Date: 2025-11-14
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: profiles
-- User profiles with i18n preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- i18n Preferences
  preferred_language VARCHAR(5) DEFAULT 'de' CHECK (preferred_language IN ('de', 'en', 'fr', 'es')),
  preferred_currency VARCHAR(3) DEFAULT 'EUR' CHECK (preferred_currency IN ('EUR', 'USD', 'GBP', 'CHF')),
  preferred_timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
  preferred_date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(preferred_language);

-- =====================================================
-- TABLE: automations
-- User automation workflows
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Automation Details
  name TEXT NOT NULL,
  description TEXT,
  workflow_config JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'error', 'draft')),
  is_enabled BOOLEAN DEFAULT TRUE,
  
  -- Execution Stats
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,
  last_error_message TEXT,
  total_runs INTEGER DEFAULT 0,
  success_runs INTEGER DEFAULT 0,
  error_runs INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_automations_user_id ON public.automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_status ON public.automations(status);
CREATE INDEX IF NOT EXISTS idx_automations_enabled ON public.automations(is_enabled);
CREATE INDEX IF NOT EXISTS idx_automations_last_run ON public.automations(last_run_at DESC);

-- =====================================================
-- TABLE: automation_runs
-- Execution history for automations
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  automation_id UUID NOT NULL REFERENCES public.automations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Run Details
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'cancelled')),
  trigger_type VARCHAR(50),
  trigger_data JSONB,
  
  -- Results
  result_data JSONB,
  error_message TEXT,
  
  -- Performance
  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_runs_automation_id ON public.automation_runs(automation_id);
CREATE INDEX IF NOT EXISTS idx_runs_user_id ON public.automation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON public.automation_runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON public.automation_runs(started_at DESC);

-- =====================================================
-- TABLE: extracted_documents
-- AI-extracted documents with multilingual support
-- =====================================================
CREATE TABLE IF NOT EXISTS public.extracted_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- File Details
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size_bytes BIGINT,
  file_mime_type VARCHAR(100),
  
  -- Document Classification
  document_type VARCHAR(20) DEFAULT 'other' CHECK (document_type IN ('invoice', 'receipt', 'contract', 'other')),
  
  -- Extracted Data
  extracted_data JSONB,
  raw_text TEXT,
  
  -- AI Processing
  document_language VARCHAR(5) CHECK (document_language IN ('de', 'en', 'fr', 'es', 'other')),
  user_language VARCHAR(5) CHECK (user_language IN ('de', 'en', 'fr', 'es')),
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_model VARCHAR(50),
  processing_time_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.extracted_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.extracted_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_language ON public.extracted_documents(document_language, user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.extracted_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_confidence ON public.extracted_documents(confidence_score);

-- =====================================================
-- TABLE: automation_templates
-- Pre-built automation templates (multilingual)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.automation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Identification
  internal_name VARCHAR(100) UNIQUE NOT NULL,
  icon TEXT,
  category VARCHAR(50), -- 'finance', 'communication', 'productivity', etc.
  
  -- Multilingual Content (JSONB)
  translations JSONB NOT NULL DEFAULT '{}',
  -- Structure: {"de": {"name": "...", "description": "...", "steps": [...]}, "en": {...}}
  
  -- Workflow Configuration
  workflow_config JSONB NOT NULL DEFAULT '{}',
  
  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.automation_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.automation_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.automation_templates(is_featured);

-- =====================================================
-- TABLE: integrations
-- External service integrations per user
-- =====================================================
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Integration Details
  service_name VARCHAR(50) NOT NULL, -- 'gmail', 'google_sheets', 'dropbox', etc.
  service_type VARCHAR(50), -- 'email', 'storage', 'spreadsheet', etc.
  
  -- Connection Status
  is_connected BOOLEAN DEFAULT FALSE,
  connection_status VARCHAR(20) DEFAULT 'disconnected',
  
  -- OAuth/API Tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Configuration
  config_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_connected_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_service ON public.integrations(service_name);
CREATE INDEX IF NOT EXISTS idx_integrations_connected ON public.integrations(is_connected);

-- =====================================================
-- TABLE: audit_logs
-- GDPR compliance: Track all data access/modifications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Action Details
  action VARCHAR(50) NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', etc.
  resource_type VARCHAR(50) NOT NULL, -- 'automation', 'document', 'profile', etc.
  resource_id UUID,
  
  -- Request Details
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  
  -- Changes (for updates)
  old_data JSONB,
  new_data JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS POLICIES: automations
-- =====================================================
CREATE POLICY "Users can view own automations" 
  ON public.automations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own automations" 
  ON public.automations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own automations" 
  ON public.automations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own automations" 
  ON public.automations FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: automation_runs
-- =====================================================
CREATE POLICY "Users can view own automation runs" 
  ON public.automation_runs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own automation runs" 
  ON public.automation_runs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: extracted_documents
-- =====================================================
CREATE POLICY "Users can view own documents" 
  ON public.extracted_documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents" 
  ON public.extracted_documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" 
  ON public.extracted_documents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" 
  ON public.extracted_documents FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: integrations
-- =====================================================
CREATE POLICY "Users can view own integrations" 
  ON public.integrations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations" 
  ON public.integrations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" 
  ON public.integrations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" 
  ON public.integrations FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: audit_logs
-- =====================================================
CREATE POLICY "Users can view own audit logs" 
  ON public.audit_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: automation_templates (Public Read)
-- =====================================================
CREATE POLICY "Anyone can view active templates" 
  ON public.automation_templates FOR SELECT 
  USING (is_active = true);

-- =====================================================
-- FUNCTIONS: Update timestamp on update
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.extracted_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.automation_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Example Templates
-- =====================================================
INSERT INTO public.automation_templates (internal_name, icon, category, translations, workflow_config, is_featured)
VALUES (
  'invoice_processing',
  '📧',
  'finance',
  '{
    "de": {
      "name": "Rechnungsverarbeitung",
      "description": "Rechnungen in E-Mails erkennen, Daten extrahieren und in Tabelle einfügen",
      "steps": [
        "Gmail verbinden",
        "Nach Rechnungen suchen",
        "Daten mit KI extrahieren",
        "In Google Sheets einfügen",
        "Zahlungserinnerung setzen"
      ]
    },
    "en": {
      "name": "Invoice Processing",
      "description": "Detect invoices in emails, extract data, and add to spreadsheet",
      "steps": [
        "Connect Gmail",
        "Search for invoices",
        "Extract data with AI",
        "Add to Google Sheets",
        "Set payment reminder"
      ]
    }
  }'::jsonb,
  '{
    "trigger": {"type": "email", "integration": "gmail", "conditions": [{"field": "subject", "operator": "contains", "value": ["Rechnung", "Invoice"]}]},
    "actions": [
      {"type": "ai_extract", "model": "gpt-4", "fields": ["invoice_number", "amount", "due_date", "vendor"]},
      {"type": "spreadsheet_append", "integration": "google_sheets", "sheet_name": "Invoices"}
    ]
  }'::jsonb,
  true
)
ON CONFLICT (internal_name) DO NOTHING;

-- =====================================================
-- COMPLETE SCHEMA SETUP
-- =====================================================
-- Schema version: 5.0
-- Last updated: 2025-11-14
-- =====================================================
