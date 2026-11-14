import { NextResponse } from "next/server";
import { generateExperimentalForecast, evaluateForecast } from "@/lib/analytics/forecasting.ts";
import { INITIAL_VERIFIED_ROUNDS } from "@/lib/data/sample-data.ts";

export async function GET(request: Request) {
  const history = INITIAL_VERIFIED_ROUNDS.map((r) => r.multiplier);
  const forecast = generateExperimentalForecast(history, INITIAL_VERIFIED_ROUNDS.length + 1);

  return NextResponse.json({
    latestForecast: forecast,
    historicalBaselineCount: history.length,
    methodology: "Dirichlet-Multinomial Bayesian Shrinkage against 97% RTP Prior",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { history, targetRoundNumber } = body;

    if (!Array.isArray(history)) {
      return NextResponse.json(
        { error: "history must be an array of numbers" },
        { status: 400 }
      );
    }

    const forecast = generateExperimentalForecast(history, targetRoundNumber || history.length + 1);
    return NextResponse.json(forecast);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate experimental forecast" },
      { status: 500 }
    );
  }
}
