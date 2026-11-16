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
