-- ============================================================================
-- AVIATOR INTELLIGENCE X (AIX) — MASTER DATABASE SCHEMA
-- Migration: 20261114000000_aix_master_schema.sql
-- Covers all 25 required tables, indexes, RLS policies, and owner bootstrap.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES & AUTH RBAC
-- ============================================================================

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'USER')),
    assigned_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_role UNIQUE (user_id, role)
);

-- Table 3: access_requests
CREATE TABLE IF NOT EXISTS public.access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    organization TEXT,
    intended_use TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 4: user_permissions
CREATE TABLE IF NOT EXISTS public.user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    granted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_perm UNIQUE (user_id, permission_key)
);

-- ============================================================================
-- 2. DATA INGESTION & AVIATOR ROUNDS
-- ============================================================================

-- Table 7: data_sources
CREATE TABLE IF NOT EXISTS public.data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    source_type TEXT NOT NULL CHECK (source_type IN ('live_verified', 'delayed', 'historical_import', 'manual_entry', 'demonstration')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'degraded', 'error')),
    reliability_score NUMERIC(5,2) DEFAULT 100.00,
    api_endpoint TEXT,
    last_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 6: historical_imports
CREATE TABLE IF NOT EXISTS public.historical_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    duplicate_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    error_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 5: aviator_rounds
CREATE TABLE IF NOT EXISTS public.aviator_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_number BIGINT UNIQUE,
    multiplier NUMERIC(10,2) NOT NULL CHECK (multiplier >= 1.00),
    crash_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    server_seed_hash TEXT,
    client_seed TEXT,
    nonce BIGINT,
    is_provably_fair BOOLEAN DEFAULT FALSE,
    source_id UUID REFERENCES public.data_sources(id) ON DELETE SET NULL,
    import_id UUID REFERENCES public.historical_imports(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 8: data_ingestion_logs
CREATE TABLE IF NOT EXISTS public.data_ingestion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.data_sources(id) ON DELETE CASCADE,
    level TEXT NOT NULL CHECK (level IN ('INFO', 'WARN', 'ERROR', 'FATAL')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. 100-AGENT INTELLIGENCE ENGINE
-- ============================================================================

-- Table 10: ai_providers
CREATE TABLE IF NOT EXISTS public.ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('gemini', 'groq', 'ollama', 'openrouter', 'anthropic', 'openai', 'local_heuristic')),
    base_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_free_tier BOOLEAN NOT NULL DEFAULT TRUE,
    rpm_limit INTEGER DEFAULT 60,
    tpm_limit INTEGER DEFAULT 40000,
    current_health TEXT NOT NULL DEFAULT 'healthy' CHECK (current_health IN ('healthy', 'rate_limited', 'degraded', 'offline')),
    last_health_check TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 9: ai_agents
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id TEXT PRIMARY KEY, -- e.g. 'stat-01', 'crit-04', 'council-01'
    name TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN (
        'STATISTICAL', 'PATTERN', 'MATHEMATICAL', 'FORECAST', 
        'CRITIC', 'STRATEGIC', 'LIVE', 'RISK', 'RESEARCH', 'COUNCIL'
    )),
    role_description TEXT NOT NULL,
    primary_provider_id UUID REFERENCES public.ai_providers(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    execution_priority INTEGER NOT NULL DEFAULT 5,
    calibration_score NUMERIC(5,4) DEFAULT 0.5000,
    total_runs INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 11: ai_tasks
CREATE TABLE IF NOT EXISTS public.ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type TEXT NOT NULL,
    target_round_id UUID REFERENCES public.aviator_rounds(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
    initiated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- Table 12: ai_agent_outputs
CREATE TABLE IF NOT EXISTS public.ai_agent_outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.aviator_rounds(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'flagged_unjustified')),
    findings TEXT NOT NULL,
    calculations JSONB NOT NULL DEFAULT '{}'::jsonb,
    uncertainty_score NUMERIC(5,4) CHECK (uncertainty_score BETWEEN 0.0 AND 1.0),
    tokens_used INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 13: ai_debates
CREATE TABLE IF NOT EXISTS public.ai_debates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
    critic_agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    target_agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('sample_size', 'overfitting', 'correlation_causation', 'false_pattern', 'math_error', 'unsupported_claim')),
    critique TEXT NOT NULL,
    defense TEXT,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolution_verdict TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 14: council_reports
CREATE TABLE IF NOT EXISTS public.council_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES public.ai_tasks(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.aviator_rounds(id) ON DELETE SET NULL,
    research_question TEXT NOT NULL,
    available_evidence TEXT NOT NULL,
    statistical_findings TEXT NOT NULL,
    agent_opinions JSONB NOT NULL DEFAULT '[]'::jsonb,
    contradicting_opinions JSONB NOT NULL DEFAULT '[]'::jsonb,
    mathematical_verification JSONB NOT NULL DEFAULT '{}'::jsonb,
    consensus_summary TEXT NOT NULL,
    confidence_level NUMERIC(5,4) NOT NULL,
    uncertainty_level NUMERIC(5,4) NOT NULL,
    limitations TEXT NOT NULL,
    final_conclusion TEXT NOT NULL,
    is_rejected_insufficient_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. ANALYTICS, FORECAST RESEARCH & MODEL PERFORMANCE
-- ============================================================================

-- Table 15: statistical_analyses
CREATE TABLE IF NOT EXISTS public.statistical_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    window_size INTEGER NOT NULL,
    sample_count INTEGER NOT NULL,
    mean_val NUMERIC(10,4) NOT NULL,
    median_val NUMERIC(10,4) NOT NULL,
    std_dev NUMERIC(10,4) NOT NULL,
    variance_val NUMERIC(10,4) NOT NULL,
    percentiles JSONB NOT NULL DEFAULT '{}'::jsonb,
    multiplier_bins JSONB NOT NULL DEFAULT '{}'::jsonb,
    ks_test_pvalue NUMERIC(10,6),
    runs_test_pvalue NUMERIC(10,6),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 16: experimental_forecasts
CREATE TABLE IF NOT EXISTS public.experimental_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_round_number BIGINT,
    forecast_horizon INTEGER NOT NULL DEFAULT 1,
    predicted_distribution JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"p_under_2": 0.52, "p_2_to_10": 0.38, "p_over_10": 0.10}
    expected_value NUMERIC(10,4),
    uncertainty_metric NUMERIC(5,4) NOT NULL,
    contributing_models JSONB NOT NULL DEFAULT '[]'::jsonb,
    council_assessment_id UUID REFERENCES public.council_reports(id) ON DELETE SET NULL,
    actual_outcome NUMERIC(10,2),
    status TEXT NOT NULL DEFAULT 'pending_outcome' CHECK (status IN ('pending_outcome', 'evaluated', 'insufficient_evidence')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 17: forecast_evaluations
CREATE TABLE IF NOT EXISTS public.forecast_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_id UUID NOT NULL REFERENCES public.experimental_forecasts(id) ON DELETE CASCADE,
    actual_outcome NUMERIC(10,2) NOT NULL,
    brier_score NUMERIC(10,6) NOT NULL,
    log_loss NUMERIC(10,6),
    absolute_error NUMERIC(10,4),
    calibration_bucket TEXT,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 18: model_performance
CREATE TABLE IF NOT EXISTS public.model_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    evaluation_window TEXT NOT NULL DEFAULT 'rolling_100',
    total_evaluations INTEGER NOT NULL DEFAULT 0,
    mean_brier_score NUMERIC(10,6) DEFAULT 0.000000,
    expected_calibration_error NUMERIC(10,6) DEFAULT 0.000000,
    accuracy_percentage NUMERIC(5,2) DEFAULT 0.00,
    ranking_score NUMERIC(10,4) DEFAULT 0.0000,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_agent_perf_window UNIQUE (agent_id, evaluation_window)
);

-- Table 19: risk_reports
CREATE TABLE IF NOT EXISTS public.risk_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    window_rounds INTEGER NOT NULL,
    volatility_metric NUMERIC(10,4) NOT NULL,
    max_consecutive_busts INTEGER NOT NULL,
    risk_of_ruin_estimates JSONB NOT NULL DEFAULT '{}'::jsonb,
    sustainability_rating TEXT NOT NULL,
    responsible_play_warnings TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. AUDIT, LOGS, SYSTEM SETTINGS & TELEMETRY
-- ============================================================================

-- Table 20: user_activity_logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 21: security_audit_logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g. 'LOGIN_FAILURE', 'ROLE_CHANGE', 'OWNER_ACTION'
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    ip_address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 22: system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 23: notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_alerts BOOLEAN NOT NULL DEFAULT FALSE,
    in_app_council_completion BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_ingestion_failures BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 24: feature_access
CREATE TABLE IF NOT EXISTS public.feature_access (
    feature_key TEXT PRIMARY KEY,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    min_role TEXT NOT NULL DEFAULT 'USER' CHECK (min_role IN ('OWNER', 'ADMIN', 'USER')),
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 25: system_health
CREATE TABLE IF NOT EXISTS public.system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL UNIQUE, -- e.g. 'database', 'ai_orchestrator', 'ingestion_stream', 'evaluator'
    status TEXT NOT NULL CHECK (status IN ('OPERATIONAL', 'DEGRADED', 'OUTAGE')),
    latency_ms INTEGER,
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    details JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_aviator_rounds_crash_time ON public.aviator_rounds (crash_time DESC);
CREATE INDEX IF NOT EXISTS idx_aviator_rounds_multiplier ON public.aviator_rounds (multiplier);
CREATE INDEX IF NOT EXISTS idx_aviator_rounds_round_num ON public.aviator_rounds (round_number);
CREATE INDEX IF NOT EXISTS idx_ai_agent_outputs_agent ON public.ai_agent_outputs (agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_outputs_task ON public.ai_agent_outputs (task_id);
CREATE INDEX IF NOT EXISTS idx_experimental_forecasts_round ON public.experimental_forecasts (target_round_number);
CREATE INDEX IF NOT EXISTS idx_forecast_evaluations_forecast ON public.forecast_evaluations (forecast_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created ON public.security_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_created ON public.user_activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles (user_id);

-- ============================================================================
-- 7. HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'OWNER'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role IN ('OWNER', 'ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_approved_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND status = 'approved'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES ON ALL 25 TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aviator_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_ingestion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.council_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistical_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experimental_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- 1. profiles: users can read their own or admins can read all; only owner/admins can update roles/status
CREATE POLICY "Users view own profile, admins view all" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own display_name" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- 2. user_roles: read by user and admin; write strictly OWNER
CREATE POLICY "Users read own role, admins read all" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Owner controls all roles" ON public.user_roles
    FOR ALL USING (public.is_owner());

-- 3. access_requests: users read own request; admins read/update
CREATE POLICY "Users insert/read own access request" ON public.access_requests
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users submit access request" ON public.access_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage access requests" ON public.access_requests
    FOR ALL USING (public.is_admin());

-- 4. user_permissions: read by owner/admin
CREATE POLICY "Owner manages user permissions" ON public.user_permissions
    FOR ALL USING (public.is_owner());
CREATE POLICY "Users read own permissions" ON public.user_permissions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- 5. aviator_rounds: readable by approved users; write by admin
CREATE POLICY "Approved users view rounds" ON public.aviator_rounds
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage rounds" ON public.aviator_rounds
    FOR ALL USING (public.is_admin());

-- 6. historical_imports: approved users view; admins manage
CREATE POLICY "Approved users view imports" ON public.historical_imports
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage imports" ON public.historical_imports
    FOR ALL USING (public.is_admin());

-- 7. data_sources: approved users view; admins manage
CREATE POLICY "Approved users view data sources" ON public.data_sources
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage data sources" ON public.data_sources
    FOR ALL USING (public.is_admin());

-- 8. data_ingestion_logs: admins only
CREATE POLICY "Admins view ingestion logs" ON public.data_ingestion_logs
    FOR ALL USING (public.is_admin());

-- 9. ai_agents: approved users view; owner/admins manage
CREATE POLICY "Approved users view agents" ON public.ai_agents
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage agents" ON public.ai_agents
    FOR ALL USING (public.is_admin());

-- 10. ai_providers: admins view; OWNER strictly manages credentials & configs
CREATE POLICY "Admins view providers" ON public.ai_providers
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Owner manages providers" ON public.ai_providers
    FOR ALL USING (public.is_owner());

-- 11. ai_tasks: approved users can create & view; admins manage
CREATE POLICY "Approved users view and run tasks" ON public.ai_tasks
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Approved users insert tasks" ON public.ai_tasks
    FOR INSERT WITH CHECK (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage tasks" ON public.ai_tasks
    FOR ALL USING (public.is_admin());

-- 12. ai_agent_outputs: approved users view; admins manage
CREATE POLICY "Approved users view agent outputs" ON public.ai_agent_outputs
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "System/Admin write agent outputs" ON public.ai_agent_outputs
    FOR ALL USING (public.is_admin());

-- 13. ai_debates: approved users view; admins manage
CREATE POLICY "Approved users view debates" ON public.ai_debates
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage debates" ON public.ai_debates
    FOR ALL USING (public.is_admin());

-- 14. council_reports: approved users view; admins manage
CREATE POLICY "Approved users view council reports" ON public.council_reports
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage council reports" ON public.council_reports
    FOR ALL USING (public.is_admin());

-- 15. statistical_analyses: approved users view; admins manage
CREATE POLICY "Approved users view statistical analyses" ON public.statistical_analyses
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage statistical analyses" ON public.statistical_analyses
    FOR ALL USING (public.is_admin());

-- 16. experimental_forecasts: approved users view; admins manage
CREATE POLICY "Approved users view forecasts" ON public.experimental_forecasts
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage forecasts" ON public.experimental_forecasts
    FOR ALL USING (public.is_admin());

-- 17. forecast_evaluations: approved users view; admins manage
CREATE POLICY "Approved users view evaluations" ON public.forecast_evaluations
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage evaluations" ON public.forecast_evaluations
    FOR ALL USING (public.is_admin());

-- 18. model_performance: approved users view; admins manage
CREATE POLICY "Approved users view model performance" ON public.model_performance
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage model performance" ON public.model_performance
    FOR ALL USING (public.is_admin());

-- 19. risk_reports: approved users view; admins manage
CREATE POLICY "Approved users view risk reports" ON public.risk_reports
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Admins manage risk reports" ON public.risk_reports
    FOR ALL USING (public.is_admin());

-- 20. user_activity_logs: users read own activity; admins view all
CREATE POLICY "Users read own activity" ON public.user_activity_logs
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "System inserts activity logs" ON public.user_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 21. security_audit_logs: OWNER and ADMIN view only
CREATE POLICY "Admins view security logs" ON public.security_audit_logs
    FOR SELECT USING (public.is_admin());
CREATE POLICY "Owner manages security logs" ON public.security_audit_logs
    FOR ALL USING (public.is_owner());

-- 22. system_settings: approved users read public keys; OWNER modifies
CREATE POLICY "Users read system settings" ON public.system_settings
    FOR SELECT USING (public.is_approved_user() OR public.is_admin());
CREATE POLICY "Owner manages system settings" ON public.system_settings
    FOR ALL USING (public.is_owner());

-- 23. notification_preferences: users view and edit own
CREATE POLICY "Users manage own notification prefs" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- 24. feature_access: users read; OWNER manages
CREATE POLICY "Users read feature flags" ON public.feature_access
    FOR SELECT USING (true);
CREATE POLICY "Owner manages feature flags" ON public.feature_access
    FOR ALL USING (public.is_owner());

-- 25. system_health: users read; admins manage
CREATE POLICY "Users read system health" ON public.system_health
    FOR SELECT USING (true);
CREATE POLICY "Admins manage system health" ON public.system_health
    FOR ALL USING (public.is_admin());

-- ============================================================================
-- 9. INITIAL SEED: DEFAULT SYSTEM SETTINGS & SYSTEM HEALTH
-- ============================================================================

INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('platform_name', '"Aviator Intelligence X"'::jsonb, 'Platform official brand title'),
    ('max_active_agents', '100'::jsonb, 'Configurable limit for active agents in the chamber'),
    ('provably_fair_enforced', 'true'::jsonb, 'Enforce HMAC-SHA256 check on all incoming rounds'),
    ('forecast_evaluation_window', '100'::jsonb, 'Rounds window used for rolling Brier score calculation')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_health (component, status, latency_ms)
VALUES
    ('database', 'OPERATIONAL', 5),
    ('ai_orchestrator', 'OPERATIONAL', 12),
    ('ingestion_stream', 'OPERATIONAL', 8),
    ('evaluator', 'OPERATIONAL', 15)
ON CONFLICT (component) DO NOTHING;
-- ============================================================================
-- AVIATOR INTELLIGENCE X (AIX) — MULTI-PLATFORM UPGRADE SCHEMA
-- Migration: 20261116000000_aix_multi_platform_upgrade.sql
-- Covers all 21 multi-platform tables, indexes, constraints, and RLS policies.
-- ============================================================================

-- ============================================================================
-- 1. PLATFORM COMPATIBILITY & REGISTRY
-- ============================================================================

-- Table 1: platform_registry
CREATE TABLE IF NOT EXISTS public.platform_registry (
    id TEXT PRIMARY KEY, -- e.g. 'betway', 'hollywoodbets', 'spribe_direct', 'aix_laboratory'
    name TEXT NOT NULL UNIQUE,
    game_provider TEXT NOT NULL DEFAULT 'Spribe B2B',
    game_identifier TEXT NOT NULL DEFAULT 'aviator',
    verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'observational', 'experimental', 'unverified')),
    integration_method TEXT NOT NULL DEFAULT 'authorized_feed' CHECK (integration_method IN ('authorized_api', 'authorized_feed', 'csv_import', 'manual_entry', 'synthetic_simulation')),
    capabilities JSONB NOT NULL DEFAULT '{"real_time": true, "provably_fair": true, "historical_export": true, "independent_rng": false}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 2: platform_integrations
CREATE TABLE IF NOT EXISTS public.platform_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('REST_API', 'WEBSOCKET', 'CSV_BATCH', 'WEBHOOK', 'MANUAL')),
    api_endpoint TEXT,
    auth_type TEXT NOT NULL DEFAULT 'API_KEY' CHECK (auth_type IN ('NONE', 'API_KEY', 'BEARER_TOKEN', 'HMAC_SIGNATURE', 'OAUTH2')),
    rate_limit_rpm INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RATE_LIMITED', 'DEGRADED', 'DISABLED', 'ERROR')),
    sync_frequency_sec INTEGER NOT NULL DEFAULT 10,
    error_log JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 3: platform_game_configurations
CREATE TABLE IF NOT EXISTS public.platform_game_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE UNIQUE,
    rtp_percentage NUMERIC(5,2) NOT NULL DEFAULT 97.00 CHECK (rtp_percentage BETWEEN 80.00 AND 99.99),
    min_multiplier NUMERIC(10,2) NOT NULL DEFAULT 1.00 CHECK (min_multiplier >= 1.00),
    max_multiplier NUMERIC(12,2) NOT NULL DEFAULT 100000.00,
    instant_crash_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0303, -- ~3.03% (1 in 33)
    hash_algorithm TEXT NOT NULL DEFAULT 'HMAC-SHA512',
    provably_fair_verified BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 4: platform_data_sources
CREATE TABLE IF NOT EXISTS public.platform_data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('live_verified', 'delayed', 'historical_import', 'manual_entry', 'demonstration')),
    reliability_rating NUMERIC(5,2) NOT NULL DEFAULT 100.00 CHECK (reliability_rating BETWEEN 0.00 AND 100.00),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'degraded', 'offline')),
    last_received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_platform_source_name UNIQUE (platform_id, name)
);

-- Table 5: platform_import_jobs
CREATE TABLE IF NOT EXISTS public.platform_import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    total_records INTEGER NOT NULL DEFAULT 0,
    valid_records INTEGER NOT NULL DEFAULT 0,
    duplicate_records INTEGER NOT NULL DEFAULT 0,
    invalid_records INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_details TEXT,
    imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 6: platform_rounds
CREATE TABLE IF NOT EXISTS public.platform_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    round_number BIGINT NOT NULL,
    multiplier NUMERIC(10,2) NOT NULL CHECK (multiplier >= 1.00),
    crash_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    server_seed_hash TEXT,
    client_seed TEXT,
    nonce BIGINT,
    is_provably_fair BOOLEAN NOT NULL DEFAULT TRUE,
    data_source_type TEXT NOT NULL DEFAULT 'live_verified',
    import_job_id UUID REFERENCES public.platform_import_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_platform_round UNIQUE (platform_id, round_number)
);

-- Table 7: platform_sync_logs
CREATE TABLE IF NOT EXISTS public.platform_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('HEARTBEAT', 'POLL_ROUNDS', 'BATCH_IMPORT', 'CALIBRATION_SYNC')),
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'WARNING', 'FAILURE')),
    records_synced INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 2. CROSS-PLATFORM RESEARCH & COMPARISONS
-- ============================================================================

-- Table 8: cross_platform_analyses
CREATE TABLE IF NOT EXISTS public.cross_platform_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    comparison_platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    sample_size_base INTEGER NOT NULL,
    sample_size_comp INTEGER NOT NULL,
    ks_statistic NUMERIC(10,6) NOT NULL,
    ks_pvalue NUMERIC(10,6) NOT NULL,
    mann_whitney_u NUMERIC(16,4),
    mann_whitney_pvalue NUMERIC(10,6),
    chi_square_divergence NUMERIC(10,4),
    median_difference NUMERIC(10,4) NOT NULL,
    mean_difference NUMERIC(10,4) NOT NULL,
    is_statistically_identical BOOLEAN NOT NULL,
    transferability_score NUMERIC(5,4) NOT NULL, -- 0.0 to 1.0
    observational_disclaimer TEXT NOT NULL,
    conducted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 3. ADVANCED SIMULATION LABORATORY
-- ============================================================================

-- Table 9: simulation_models
CREATE TABLE IF NOT EXISTS public.simulation_models (
    id TEXT PRIMARY KEY, -- e.g. 'pareto-alpha-1.0', 'spribe-exact-hmac', 'bootstrap-empirical'
    model_name TEXT NOT NULL,
    distribution_type TEXT NOT NULL CHECK (distribution_type IN ('PARETO', 'EMPIRICAL_RESAMPLE', 'EXPONENTIAL', 'HMAC_DETERMINISTIC')),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 10: simulation_runs
CREATE TABLE IF NOT EXISTS public.simulation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    model_id TEXT NOT NULL REFERENCES public.simulation_models(id) ON DELETE CASCADE,
    run_name TEXT NOT NULL,
    sample_size INTEGER NOT NULL CHECK (sample_size > 0),
    random_seed TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    summary_stats JSONB NOT NULL DEFAULT '{}'::jsonb, -- mean, median, std_dev, p95, bust_rate
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 11: simulation_results
CREATE TABLE IF NOT EXISTS public.simulation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_run_id UUID NOT NULL REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    round_index INTEGER NOT NULL,
    simulated_multiplier NUMERIC(10,2) NOT NULL,
    percentile_rank NUMERIC(6,3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. REAL-GAME RECONCILIATION ENGINE
-- ============================================================================

-- Table 12: forecast_snapshots
CREATE TABLE IF NOT EXISTS public.forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    forecast_id UUID NOT NULL REFERENCES public.experimental_forecasts(id) ON DELETE CASCADE,
    target_round_number BIGINT NOT NULL,
    predicted_distribution JSONB NOT NULL,
    expected_multiplier NUMERIC(10,4),
    confidence_interval JSONB NOT NULL, -- {"lower": 1.10, "upper": 3.50, "confidence": 0.95}
    contributing_models JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_platform_forecast_target UNIQUE (platform_id, target_round_number)
);

-- Table 13: forecast_actual_results
CREATE TABLE IF NOT EXISTS public.forecast_actual_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_snapshot_id UUID NOT NULL REFERENCES public.forecast_snapshots(id) ON DELETE CASCADE UNIQUE,
    actual_multiplier NUMERIC(10,2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    verified_by TEXT NOT NULL DEFAULT 'spribe_feed_validator'
);

-- Table 14: forecast_error_metrics
CREATE TABLE IF NOT EXISTS public.forecast_error_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_snapshot_id UUID NOT NULL REFERENCES public.forecast_snapshots(id) ON DELETE CASCADE UNIQUE,
    absolute_error NUMERIC(10,4) NOT NULL,
    relative_error NUMERIC(10,4) NOT NULL,
    brier_score NUMERIC(10,6) NOT NULL,
    log_loss NUMERIC(10,6),
    is_calibrated BOOLEAN NOT NULL DEFAULT TRUE,
    calibration_bin TEXT NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. ADAPTIVE MODEL RESEARCH & VERSIONING
-- ============================================================================

-- Table 15: model_versions
CREATE TABLE IF NOT EXISTS public.model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    version_string TEXT NOT NULL, -- e.g. 'v1.0.0', 'v1.1.2-bayes'
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'STABLE' CHECK (status IN ('CANDIDATE', 'STABLE', 'DEPRECATED', 'ROLLED_BACK')),
    train_window_start BIGINT,
    train_window_end BIGINT,
    out_of_sample_brier NUMERIC(10,6) DEFAULT 0.000000,
    out_of_sample_ece NUMERIC(10,6) DEFAULT 0.000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_model_version UNIQUE (model_name, version_string)
);

-- Table 16: model_experiments
CREATE TABLE IF NOT EXISTS public.model_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES public.model_versions(id) ON DELETE CASCADE,
    experiment_type TEXT NOT NULL CHECK (experiment_type IN ('ASSUMPTION_RELAXATION', 'BAYESIAN_PRIOR_TUNING', 'WINDOW_HORIZON_TEST', 'RESAMPLING_STABILITY')),
    hypothesis TEXT NOT NULL,
    baseline_brier NUMERIC(10,6) NOT NULL,
    candidate_brier NUMERIC(10,6) NOT NULL,
    is_promoted BOOLEAN NOT NULL DEFAULT FALSE,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 17: model_calibration_reports
CREATE TABLE IF NOT EXISTS public.model_calibration_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    model_version_id UUID REFERENCES public.model_versions(id) ON DELETE SET NULL,
    ece_score NUMERIC(10,6) NOT NULL,
    max_calibration_error NUMERIC(10,6) NOT NULL,
    brier_score NUMERIC(10,6) NOT NULL,
    reliability_bins JSONB NOT NULL DEFAULT '[]'::jsonb,
    sample_count INTEGER NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 6. AGENT RESEARCH & DEBATES (100-AGENT ARCHITECTURE EXPANSION)
-- ============================================================================

-- Table 18: agent_platform_assignments
CREATE TABLE IF NOT EXISTS public.agent_platform_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    role_modifier TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_agent_platform UNIQUE (agent_id, platform_id)
);

-- Table 19: agent_research_sessions
CREATE TABLE IF NOT EXISTS public.agent_research_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    session_topic TEXT NOT NULL,
    lead_agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    session_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (session_status IN ('ACTIVE', 'CONCLUDED', 'VETOED')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- Table 20: agent_criticism_reports
CREATE TABLE IF NOT EXISTS public.agent_criticism_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.agent_research_sessions(id) ON DELETE CASCADE,
    critic_agent_id TEXT NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
    target_claim TEXT NOT NULL,
    mathematical_validity TEXT NOT NULL CHECK (mathematical_validity IN ('VALID', 'SUSPECT', 'DISPROVED', 'INSUFFICIENT_DATA')),
    fallacy_detected TEXT, -- e.g. "Gambler's Fallacy", "Small Sample Overfitting"
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table 21: agent_consensus_reports
CREATE TABLE IF NOT EXISTS public.agent_consensus_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.agent_research_sessions(id) ON DELETE CASCADE,
    platform_id TEXT NOT NULL REFERENCES public.platform_registry(id) ON DELETE CASCADE,
    consensus_summary TEXT NOT NULL,
    confidence_score NUMERIC(5,4) NOT NULL,
    uncertainty_score NUMERIC(5,4) NOT NULL,
    final_verdict TEXT NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 7. INDEXES FOR MULTI-PLATFORM PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_platform_rounds_plat_crash ON public.platform_rounds (platform_id, crash_time DESC);
CREATE INDEX IF NOT EXISTS idx_platform_rounds_multiplier ON public.platform_rounds (platform_id, multiplier);
CREATE INDEX IF NOT EXISTS idx_cross_platform_analyses_pair ON public.cross_platform_analyses (base_platform_id, comparison_platform_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_run ON public.simulation_results (simulation_run_id);
CREATE INDEX IF NOT EXISTS idx_forecast_snapshots_plat ON public.forecast_snapshots (platform_id, target_round_number);
CREATE INDEX IF NOT EXISTS idx_forecast_error_snapshot ON public.forecast_error_metrics (forecast_snapshot_id);
CREATE INDEX IF NOT EXISTS idx_agent_platform_assign ON public.agent_platform_assignments (agent_id, platform_id);

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.platform_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_game_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_platform_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_actual_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecast_error_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_calibration_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_platform_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_criticism_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_consensus_reports ENABLE ROW LEVEL SECURITY;

-- Read policies (approved users can read verified analytics)
CREATE POLICY "Approved users can read platform registry" ON public.platform_registry
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read platform game configs" ON public.platform_game_configurations
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read platform data sources" ON public.platform_data_sources
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read platform rounds" ON public.platform_rounds
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read cross platform analyses" ON public.cross_platform_analyses
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read simulation models and runs" ON public.simulation_models
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read simulation runs" ON public.simulation_runs
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read simulation results" ON public.simulation_results
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read forecast snapshots" ON public.forecast_snapshots
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read forecast actual results" ON public.forecast_actual_results
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read forecast error metrics" ON public.forecast_error_metrics
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read model versions" ON public.model_versions
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read model calibration reports" ON public.model_calibration_reports
    FOR SELECT TO authenticated USING (public.is_approved_user());

CREATE POLICY "Approved users can read agent consensus reports" ON public.agent_consensus_reports
    FOR SELECT TO authenticated USING (public.is_approved_user());

-- Write & Admin policies (Owner/Admin restricted)
CREATE POLICY "Admins manage platform registry" ON public.platform_registry
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage platform integrations" ON public.platform_integrations
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage platform game configs" ON public.platform_game_configurations
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage platform sync logs" ON public.platform_sync_logs
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage platform import jobs" ON public.platform_import_jobs
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- 9. INITIAL SEED DATA FOR PLATFORMS
-- ============================================================================

INSERT INTO public.platform_registry (id, name, game_provider, game_identifier, verification_status, integration_method, capabilities)
VALUES 
    ('betway', 'Betway Aviator', 'Spribe B2B Engine', 'aviator-betway', 'verified', 'authorized_feed', '{"real_time": true, "provably_fair": true, "historical_export": true, "independent_rng": false}'::jsonb),
    ('hollywoodbets', 'Hollywoodbets Aviator', 'Spribe B2B Engine', 'aviator-hollywoodbets', 'verified', 'authorized_feed', '{"real_time": true, "provably_fair": true, "historical_export": true, "independent_rng": false}'::jsonb),
    ('spribe_direct', 'Spribe Direct Reference', 'Spribe B2B Engine', 'aviator-spribe-direct', 'verified', 'authorized_api', '{"real_time": true, "provably_fair": true, "historical_export": true, "independent_rng": false}'::jsonb),
    ('aix_laboratory', 'AIX Simulation Laboratory', 'AIX Monte Carlo Engine', 'aix-sim-lab-v1', 'experimental', 'synthetic_simulation', '{"real_time": true, "provably_fair": true, "historical_export": true, "independent_rng": true}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    verification_status = EXCLUDED.verification_status,
    updated_at = timezone('utc'::text, now());

INSERT INTO public.platform_game_configurations (platform_id, rtp_percentage, min_multiplier, max_multiplier, instant_crash_rate, hash_algorithm, provably_fair_verified, notes)
VALUES
    ('betway', 97.00, 1.00, 100000.00, 0.0303, 'HMAC-SHA512', true, 'Regulated Spribe B2B server seed with 3 client seeds'),
    ('hollywoodbets', 97.00, 1.00, 100000.00, 0.0303, 'HMAC-SHA512', true, 'Regulated Spribe B2B server seed with 3 client seeds'),
    ('spribe_direct', 97.00, 1.00, 100000.00, 0.0303, 'HMAC-SHA512', true, 'Spribe official reference implementation'),
    ('aix_laboratory', 97.00, 1.00, 100000.00, 0.0303, 'AIX-PRNG-64', true, 'Simulation environment with configurable synthetic parameters')
ON CONFLICT (platform_id) DO UPDATE SET
    rtp_percentage = EXCLUDED.rtp_percentage,
    instant_crash_rate = EXCLUDED.instant_crash_rate;

INSERT INTO public.simulation_models (id, model_name, distribution_type, parameters, description)
VALUES
    ('spribe-exact-hmac', 'Spribe Exact HMAC-SHA512 Pareto', 'HMAC_DETERMINISTIC', '{"rtp": 0.97, "instant_crash_modulo": 33}'::jsonb, 'Exact replication of Spribe certified provably fair crash generator equation'),
    ('pareto-alpha-1.0', 'Continuous Pareto α=1.0', 'PARETO', '{"alpha": 1.0, "scale": 0.97}'::jsonb, 'Continuous theoretical Pareto distribution with 97% scale factor'),
    ('bootstrap-empirical', 'Historical Resampling Bootstrap', 'EMPIRICAL_RESAMPLE', '{"sample_pool": "latest_1000", "replacement": true}'::jsonb, 'Non-parametric bootstrap resampling with replacement from observed rounds')
ON CONFLICT (id) DO UPDATE SET
    description = EXCLUDED.description;
