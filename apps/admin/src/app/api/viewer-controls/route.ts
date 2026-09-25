import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
    }

    const controls = await prisma.eventSettings.findFirst({
      where: { eventId },
    });

    return NextResponse.json({ success: true, controls });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.eventId) {
      return NextResponse.json({ success: false, error: "eventId is required" }, { status: 400 });
    }

    const updated = await prisma.eventSettings.upsert({
      where: { eventId: body.eventId },
      update: {
        allowDownloads: body.allowDownloads ?? true,
        allowLikes: body.allowLikes ?? true,
      },
      create: {
        eventId: body.eventId,
        allowDownloads: body.allowDownloads ?? true,
        allowLikes: body.allowLikes ?? true,
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Internal error" }, { status: 500 });
  }
}
