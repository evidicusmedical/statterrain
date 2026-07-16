import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ALLOWED_ROOTS = new Set(["acs-county-population-national", "county-boundaries", "acs-national-benchmarks"]);

export async function GET(_request: Request, { params }: { params: { path: string[] } }) {
  const parts = params.path ?? [];
  if (!parts.length || !ALLOWED_ROOTS.has(parts[0]) || parts.some((part) => part.includes("..") || part.includes("/"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filePath = path.join(process.cwd(), "data", "generated", ...parts);
  try {
    const body = await readFile(filePath, "utf8");
    return new NextResponse(body, { headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
