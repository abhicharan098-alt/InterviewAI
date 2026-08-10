import { NextResponse } from "next/server";

/**
 * Public status endpoint used by the login/register pages to decide whether the
 * "Continue with Google" button can be used. Only exposes a boolean — never
 * returns or hints at the client id/secret/tokens.
 */
export function GET() {
  const available = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  return NextResponse.json({ available });
}