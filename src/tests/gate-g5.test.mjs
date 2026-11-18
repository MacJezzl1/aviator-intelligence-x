import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_REGISTRY,
  getCodeOnlyAgents,
  getHybridAgents,
  getLlmAgents,
} from "../lib/agents/registry.ts";
import {
  executeAgentTask,
  SYSTEM_PROVIDERS,
  checkBudgetGovernor,
} from "../lib/agents/providers.ts";
import { runCouncilDeliberation } from "../lib/agents/orchestrator.ts";
import {
  validateLayer1Lexicon,
  validateLayer2Mathematics,
  evaluateTruthGuard,
  FORBIDDEN_LEXICON,
} from "../lib/agents/truth-guard.ts";

test("Gate G5: 100-Agent Architecture — Exactly 100 agents across 10 departments (10 per dept)", () => {
  assert.strictEqual(AGENT_REGISTRY.length, 100, "AGENT_REGISTRY must have exactly 100 logical agents");

  const expectedDepartments = [
    "BETWAY_RESEARCH",
    "HOLLYWOODBETS_RESEARCH",
    "CROSS_PLATFORM_RESEARCH",
    "MATHEMATICAL",
    "PATTERN_RESEARCH",
    "FORECAST_RESEARCH",
    "CRITIC",
    "SIMULATION_RESEARCH",
    "RISK",
    "COUNCIL",
  ];

  const deptCounts = {};
  for (const dept of expectedDepartments) {
    deptCounts[dept] = 0;
  }

  const seenIds = new Set();

  for (const agent of AGENT_REGISTRY) {
    assert.ok(agent.id, "Agent must have an id");
    assert.ok(!seenIds.has(agent.id), `Duplicate agent ID: ${agent.id}`);
    seenIds.add(agent.id);

    assert.ok(agent.name, `Agent ${agent.id} must have a name`);
    assert.ok(agent.specialization, `Agent ${agent.id} must have a specialization`);
    assert.ok(expectedDepartments.includes(agent.department), `Unknown department: ${agent.department}`);
    deptCounts[agent.department]++;
  }

  for (const dept of expectedDepartments) {
    assert.strictEqual(
      deptCounts[dept],
      10,
      `Department ${dept} must contain exactly 10 agents, found ${deptCounts[dept]}`
    );
  }

  // Verify Section 6.3 class totals: 59 CODE, 5 HYB, 36 LLM
  const codeAgents = getCodeOnlyAgents();
  const hybAgents = getHybridAgents();
  const llmAgents = getLlmAgents();

  assert.strictEqual(codeAgents.length, 59, "Class totals must contain exactly 59 CODE agents (Rule T3, Section 6.3)");
  assert.strictEqual(hybAgents.length, 5, "Class totals must contain exactly 5 HYB agents (Section 6.3)");
  assert.strictEqual(llmAgents.length, 36, "Class totals must contain exactly 36 LLM agents (Section 6.3)");
  assert.strictEqual(codeAgents.length + hybAgents.length + llmAgents.length, 100, "Sum of all execution classes must equal 100");
});

test("Gate G5: Truth Guard Layer 1 — Blocks 100% of forbidden marketing lexicon", () => {
  for (const phrase of FORBIDDEN_LEXICON) {
    const dirtyText = `Our revolutionary system offers ${phrase} on every single round.`;
    const res = validateLayer1Lexicon(dirtyText);
    assert.strictEqual(res.isValid, false, `Failed to flag forbidden phrase: "${phrase}"`);
    assert.ok(res.violations.includes(phrase));
    assert.ok(res.sanitizedText.includes("[TRUTH_GUARD_REDACTED_PROHIBITED_CLAIM]"));
  }

  // Valid scientific statement must pass
  const cleanText = "Analyzed empirical distribution across 500 rounds. Null hypothesis of memoryless RNG cannot be rejected.";
  const cleanRes = validateLayer1Lexicon(cleanText);
  assert.strictEqual(cleanRes.isValid, true);
  assert.strictEqual(cleanRes.violations.length, 0);
  assert.strictEqual(cleanRes.sanitizedText, cleanText);
});

test("Gate G5: Truth Guard Layer 2 — Validates mathematical coherence and probability bounds", () => {
  // Valid probability distribution
  const validDist = {
    p_under_2x: 0.515,
    p_2x_to_5x: 0.291,
    p_5x_to_10x: 0.097,
    p_over_10x: 0.097,
  };
  const validMath = validateLayer2Mathematics({
    distribution: validDist,
    uncertaintyScore: 0.45,
  });
  assert.strictEqual(validMath.isValid, true);
  assert.strictEqual(validMath.errors.length, 0);

  // Invalid: probabilities sum to 1.50
  const invalidSum = {
    p_under_2x: 0.8,
    p_2x_to_5x: 0.7,
  };
  const sumCheck = validateLayer2Mathematics({ distribution: invalidSum });
  assert.strictEqual(sumCheck.isValid, false);
  assert.ok(sumCheck.errors.some((e) => e.includes("Probabilities do not sum to 1.0")));

  // Invalid: zero uncertainty claimed on stochastic process
  const zeroUncertainty = validateLayer2Mathematics({ uncertaintyScore: 0 });
  assert.strictEqual(zeroUncertainty.isValid, false);
  assert.ok(zeroUncertainty.errors.some((e) => e.includes("Uncertainty score cannot be zero")));

  // Invalid: sample size < 30 requires insufficient evidence
  const smallSample = validateLayer2Mathematics({ sampleSize: 15 });
  assert.strictEqual(smallSample.isValid, false);
  assert.ok(smallSample.errors.some((e) => e.includes("INSUFFICIENT EVIDENCE")));
});

test("Gate G5: End-to-End Orchestrator & Provider Fallback — Genuine statistical execution without fake dialogue", async () => {
  // Provider fallback exists
  const localProvider = SYSTEM_PROVIDERS.find((p) => p.type === "local_heuristic");
  assert.ok(localProvider, "Must maintain local heuristic fallback provider");
  assert.strictEqual(localProvider.isActive, true);

  // Execute single agent task
  const agentTask = await executeAgentTask({
    agentId: "btw-01",
    department: "STATISTICAL",
    specialization: "Betway historical multiplier frequency distribution & histogram mapping",
    researchQuestion: "Test empirical convergence against 97% RTP",
    roundHistory: [1.2, 1.8, 3.4, 1.05, 10.5, 2.1, 1.45, 1.1, 4.8, 1.3],
  });

  assert.strictEqual(agentTask.status, "success");
  assert.ok(agentTask.findings.length > 0);
  assert.ok(agentTask.uncertaintyScore > 0);
  assert.ok(agentTask.calculations.sampleSize === 10);

  // Run full 100-Agent council deliberation
  const councilRun = await runCouncilDeliberation({
    roundHistory: Array.from({ length: 40 }, (_, i) => 1.1 + (i % 8) * 0.4),
    researchQuestion: "Evaluate distribution divergence across historical window",
  });

  assert.ok(councilRun.taskId.startsWith("task-"));
  assert.ok(councilRun.activeAgentsOutput.length >= 10);
  assert.ok(councilRun.debates.length > 0);
  assert.ok(councilRun.councilReport.consensusSummary.length > 0);
  assert.ok(councilRun.councilReport.confidenceLevel >= 0 && councilRun.councilReport.confidenceLevel <= 1);
});

test("Gate G5: Code-Only Mode (L3 Degradation Ladder) — Full deliberation with zero external model calls", async () => {
  const history = Array.from({ length: 45 }, (_, i) => 1.05 + (i % 7) * 0.35);
  const codeOnlyRun = await runCouncilDeliberation({
    roundHistory: history,
    codeOnly: true,
  });

  assert.strictEqual(
    codeOnlyRun.totalAgentsInvoked,
    59,
    "Code-only mode must invoke all 59 deterministic CODE agents"
  );
  assert.strictEqual(
    codeOnlyRun.activeAgentsOutput.length,
    59,
    "Must have outputs from all 59 CODE agents"
  );

  for (const out of codeOnlyRun.activeAgentsOutput) {
    assert.strictEqual(
      out.providerUsed,
      "Local Deterministic Code Engine",
      `Agent ${out.agentId} must run on local deterministic engine in code-only mode`
    );
    assert.strictEqual(
      out.tokensUsed,
      0,
      `Agent ${out.agentId} must consume 0 external LLM tokens in code-only mode`
    );
  }

  assert.ok(codeOnlyRun.councilReport.statisticalFindings.length > 0);
  assert.strictEqual(codeOnlyRun.councilReport.isRejectedInsufficientEvidence, false);
});

test("Gate G5: Budget Governor & Rate Limiting — Daily quota ceilings and concurrency control", () => {
  const status = checkBudgetGovernor(500);
  assert.strictEqual(typeof status.dailyQuotaTokens, "number");
  assert.ok(status.dailyQuotaTokens >= 50000, "Daily quota must be configured");
  assert.strictEqual(typeof status.remainingTokens, "number");
  assert.strictEqual(typeof status.isBudgetExceeded, "boolean");

  // Extreme request exceeding daily quota must be flagged as budget exceeded
  const excessiveStatus = checkBudgetGovernor(1000000);
  assert.strictEqual(excessiveStatus.isBudgetExceeded, true, "Must flag budget exceeded on out-of-bounds token request");
});

test("Gate G5: Anti-Fake Theatre — Rejection of simulated live dialogue and manufactured certainty", () => {
  // Direct test of fake output injection through Truth Guard
  const fakeClaims = [
    "Our AI predictor achieved 99% accuracy across the last 100 rounds.",
    "Follow this unbeatable signal for guaranteed profit.",
    "System detected a sure win pattern on Hollywoodbets.",
  ];

  for (const claim of fakeClaims) {
    const evaluation = evaluateTruthGuard({
      findings: claim,
      uncertaintyScore: 0.1,
    });
    assert.strictEqual(evaluation.isApproved, false, `Fake claim "${claim}" must be rejected by Truth Guard`);
    assert.ok(evaluation.layer1.violations.length > 0);
    assert.ok(evaluation.finalFindings.includes("[TRUTH_GUARD_REDACTED_PROHIBITED_CLAIM]"));
  }
});
