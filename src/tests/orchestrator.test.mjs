import test from "node:test";
import assert from "node:assert/strict";
import { AGENT_REGISTRY } from "../lib/agents/registry.ts";
import { runCouncilDeliberation } from "../lib/agents/orchestrator.ts";

test("AGENT_REGISTRY - contains exactly 100 specialized logical agents across 10 departments", () => {
  assert.equal(AGENT_REGISTRY.length, 100);

  const departments = new Set(AGENT_REGISTRY.map((a) => a.department));
  assert.equal(departments.size, 10);

  const deptCounts = {};
  for (const a of AGENT_REGISTRY) {
    deptCounts[a.department] = (deptCounts[a.department] || 0) + 1;
  }

  assert.equal(deptCounts["STATISTICAL"], 15);
  assert.equal(deptCounts["PATTERN"], 15);
  assert.equal(deptCounts["MATHEMATICAL"], 10);
  assert.equal(deptCounts["FORECAST"], 10);
  assert.equal(deptCounts["CRITIC"], 10);
  assert.equal(deptCounts["STRATEGIC"], 10);
  assert.equal(deptCounts["LIVE"], 10);
  assert.equal(deptCounts["RISK"], 10);
  assert.equal(deptCounts["RESEARCH"], 5);
  assert.equal(deptCounts["COUNCIL"], 5);
});

test("runCouncilDeliberation - executes multi-agent debate and produces structured 10-point consensus", async () => {
  const history = [1.5, 2.8, 1.2, 4.0, 1.9, 3.2, 1.1, 7.5, 1.8, 2.1, 1.4, 2.9, 1.3, 5.5, 1.6, 2.3, 1.7, 3.8, 1.4, 2.2, 1.9, 2.5];
  const result = await runCouncilDeliberation({
    roundHistory: history,
    researchQuestion: "Test independence verification",
  });

  assert.ok(result.totalAgentsInvoked > 0);
  assert.ok(result.debates.length > 0);
  assert.ok(result.councilReport.consensusSummary.length > 0);
  assert.ok(result.councilReport.finalConclusion.length > 0);
  assert.ok(result.councilReport.confidenceLevel >= 0 && result.councilReport.confidenceLevel <= 1);
  assert.ok(result.councilReport.uncertaintyLevel >= 0 && result.councilReport.uncertaintyLevel <= 1);
});
