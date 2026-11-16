import { NextResponse } from "next/server";
import { isServerConfiguredOwner, verifyBootstrapSecret, consumeBootstrapToken, isBootstrapTokenConsumed } from "@/lib/auth/rbac.ts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, bootstrapSecret } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (bootstrapSecret && isBootstrapTokenConsumed()) {
      return NextResponse.json(
        {
          success: false,
          error: "Bootstrap token has already been consumed and invalidated.",
          code: "TOKEN_ALREADY_CONSUMED",
        },
        { status: 410 }
      );
    }

    const isOwnerByEmail = isServerConfiguredOwner(email);
    const isOwnerBySecret = verifyBootstrapSecret(bootstrapSecret);

    if (isOwnerByEmail || isOwnerBySecret) {
      if (isOwnerBySecret) {
        consumeBootstrapToken();
      }
      return NextResponse.json({
        success: true,
        role: "OWNER",
        verifiedServerSide: true,
        message: "Owner bootstrap credentials verified successfully.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        role: "USER",
        verifiedServerSide: true,
        message: "Email is not configured as initial owner. Standard user access assigned pending admin approval.",
      },
      { status: 403 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process bootstrap request" },
      { status: 500 }
    );
  }
}
