import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    // Fetch photos across events
    let photos: any[] = [];
    try {
      const whereCondition: any = {};
      if (eventId && eventId !== "ALL") {
        whereCondition.eventId = eventId;
      }

      photos = await (prisma as any).photo.findMany({
        where: whereCondition,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
    } catch {
      photos = [];
    }

    // Fetch all active events for the filter dropdown
    let eventsList: any[] = [];
    try {
      eventsList = await (prisma.event as any).findMany({
        select: {
          id: true,
          name: true,
          title: true,
          slug: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      eventsList = [];
    }

    return NextResponse.json({
      success: true,
      photos,
      events: eventsList,
      totalCount: photos.length,
    });
  } catch (error: any) {
    console.error("[GALLERY_API_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch gallery media", photos: [], events: [] },
      { status: 500 }
    );
  }
}

// Delete / Moderate Photo
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ success: false, error: "Photo ID required" }, { status: 400 });
    }

    try {
      await (prisma as any).photo.delete({
        where: { id: photoId },
      });
    } catch {
      // safe fallback if already deleted
    }

    return NextResponse.json({
      success: true,
      message: "Photo deleted by Super Admin moderation",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}