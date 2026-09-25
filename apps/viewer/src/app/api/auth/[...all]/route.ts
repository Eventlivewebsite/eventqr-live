import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { auth } = await import("@repo/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  const handlers = toNextJsHandler(auth);
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const { auth } = await import("@repo/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  const handlers = toNextJsHandler(auth);
  return handlers.POST(req);
}