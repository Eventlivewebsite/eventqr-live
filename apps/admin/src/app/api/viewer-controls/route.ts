import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        photos: {
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    });

    return NextResponse.json({ event, photos: event?.photos || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { photoId, action, eventId, liveFeedPaused } = await req.json();

    if (eventId && typeof liveFeedPaused === "boolean") {
      await prisma.event.update({
        where: { id: eventId },
        data: { liveFeedPaused }
      });
      return NextResponse.json({ success: true, liveFeedPaused });
    }

    if (action === "TOGGLE_APPROVE" && photoId) {
      const photo = await prisma.photo.findUnique({ where: { id: photoId } });
      const updated = await prisma.photo.update({
        where: { id: photoId },
        data: { isApproved: !photo?.isApproved }
      });
      return NextResponse.json({ success: true, photo: updated });
    }

    if (action === "DELETE" && photoId) {
      await prisma.photo.delete({ where: { id: photoId } });
      return NextResponse.json({ success: true, deleted: photoId });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
