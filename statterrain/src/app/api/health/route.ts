import { NextResponse } from "next/server";

/** Lightweight local readiness target for production browser verification. */
export function GET() {
  return NextResponse.json({
    status: "ok",
    product: "StatTerrain",
    version: "v0.3.9.1 prototype",
  });
}
