import { NextResponse } from "next/server";
import { runCouncilDeliberation } from "@/lib/agents/orchestrator.ts";
import { INITIAL_VERIFIED_ROUNDS } from "@/lib/data/sample-data.ts";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { roundHistory, researchQuestion, selectedAgentIds } = body;

    const history = Array.isArray(roundHistory) && roundHistory.length > 0
      ? roundHistory
      : INITIAL_VERIFIED_ROUNDS.map((r) => r.multiplier);

    const result = await runCouncilDeliberation({
      roundHistory: history,
      researchQuestion,
      selectedAgentIds,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to execute council deliberation" },
      { status: 500 }
    );
  }
}
