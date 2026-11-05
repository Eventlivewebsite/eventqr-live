import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    return NextResponse.json({ event, photos: (event as any)?.photos || [] });
  } catch (err: any) {
    console.error("VIEWER_CONTROLS_GET_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, liveFeedPaused, photoId, action } = body;

    if (eventId && liveFeedPaused !== undefined) {
      await prisma.event.update({
        where: { id: eventId },
        data: { liveFeedPaused } as any,
      });
      return NextResponse.json({ success: true });
    }

    if (photoId && action === "toggleHide") {
      const photo = await (prisma as any).photo.findUnique({ where: { id: photoId } });
      const updated = await (prisma as any).photo.update({
        where: { id: photoId },
        data: { isHidden: !photo?.isHidden },
      });
      return NextResponse.json({ success: true, photo: updated });
    }

    if (photoId && action === "delete") {
      await (prisma as any).photo.delete({ where: { id: photoId } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("VIEWER_CONTROLS_POST_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
