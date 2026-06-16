import { NextResponse } from "next/server";
import { getSafeEnvStatus } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSafeEnvStatus());
}
