import { NextResponse } from "next/server";
import { INITIAL_VERIFIED_ROUNDS } from "@/lib/data/sample-data.ts";
import { validateMultiplier, type AviatorRoundRecord } from "@/lib/data/ingestion.ts";
import { verifyProvableFairRound } from "@/lib/analytics/provable-fair.ts";

// In-memory persistent cache for serverless demonstration / fallback
let cachedRounds: AviatorRoundRecord[] = [...INITIAL_VERIFIED_ROUNDS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(1000, parseInt(searchParams.get("limit") || "100", 10));
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const source = searchParams.get("source");

  let filtered = cachedRounds;
  if (source && source !== "ALL") {
    filtered = cachedRounds.filter((r) => r.sourceType === source);
  }

  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    total: filtered.length,
    limit,
    offset,
    rounds: paginated,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { multiplier, serverSeed, clientSeed, nonce, sourceType = "manual_entry" } = body;

    const validation = validateMultiplier(multiplier);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    let isFair = false;
    if (serverSeed && clientSeed) {
      const fairResult = verifyProvableFairRound({
        serverSeed,
        clientSeed,
        nonce: nonce || cachedRounds.length + 1,
        actualMultiplier: validation.normalized,
      });
      isFair = fairResult.isValid;
    }

    const nextRoundNumber = (cachedRounds[cachedRounds.length - 1]?.roundNumber || 1000) + 1;
    const newRound: AviatorRoundRecord = {
      id: `rnd-${nextRoundNumber}`,
      roundNumber: nextRoundNumber,
      multiplier: validation.normalized,
      crashTime: new Date().toISOString(),
      sourceType,
      serverSeedHash: serverSeed ? "sha256-verified" : undefined,
      clientSeed,
      nonce: nonce || nextRoundNumber,
      isProvablyFair: isFair || sourceType === "live_verified",
    };

    cachedRounds.push(newRound);

    return NextResponse.json(
      { success: true, round: newRound },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to parse round ingestion payload" },
      { status: 500 }
    );
  }
}
