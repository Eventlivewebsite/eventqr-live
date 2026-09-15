import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch event's current viewer controls and media feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ success: false, message: "Event ID required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        settings: true,
        analytics: true,
        albums: {
          include: {
            media: {
              where: { isDeleted: false },
              orderBy: { uploadedAt: "desc" },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("VIEWER_CONTROL_GET_ERR:", error);
    return NextResponse.json({ success: false, message: error?.message || "Failed" }, { status: 500 });
  }
}

// PATCH: Real-time update viewer switches & settings
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      eventId,
      isLive,
      qrEnabled,
      guestBook,
      allowGuestUpload,
      accessMode,
      pinCode,
      themeColor,
      // Settings fields
      showWatermark,
      watermarkText,
      watermarkPosition,
      allowDownloads,
      allowLikes,
      showHighlights,
      showCountdown,
      subtitle
    } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, message: "Event ID required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Core Event Flags
      const updatedEvent = await tx.event.update({
        where: { id: eventId },
        data: {
          ...(isLive !== undefined && { isLive }),
          ...(qrEnabled !== undefined && { qrEnabled }),
          ...(guestBook !== undefined && { guestBook }),
          ...(allowGuestUpload !== undefined && { allowGuestUpload }),
          ...(accessMode && { accessMode }),
          ...(pinCode !== undefined && { pinCode }),
          ...(themeColor && { themeColor }),
        },
      });

      // 2. Upsert Settings Record
      const updatedSettings = await tx.eventSettings.upsert({
        where: { eventId },
        create: {
          eventId,
          subtitle: subtitle || "Forever Begins Today",
          showWatermark: showWatermark ?? true,
          watermarkText: watermarkText || updatedEvent.title,
          watermarkPosition: watermarkPosition || "BOTTOM_RIGHT",
          allowDownloads: allowDownloads ?? true,
          allowLikes: allowLikes ?? true,
          showHighlights: showHighlights ?? true,
          showCountdown: showCountdown ?? true,
        },
        update: {
          ...(showWatermark !== undefined && { showWatermark }),
          ...(watermarkText !== undefined && { watermarkText }),
          ...(watermarkPosition !== undefined && { watermarkPosition }),
          ...(allowDownloads !== undefined && { allowDownloads }),
          ...(allowLikes !== undefined && { allowLikes }),
          ...(showHighlights !== undefined && { showHighlights }),
          ...(showCountdown !== undefined && { showCountdown }),
          ...(subtitle !== undefined && { subtitle }),
        },
      });

      return { event: updatedEvent, settings: updatedSettings };
    });

    return NextResponse.json({
      success: true,
      message: "Viewer settings updated live!",
      data: result,
    });
  } catch (error: any) {
    console.error("VIEWER_CONTROL_PATCH_ERR:", error);
    return NextResponse.json({ success: false, message: error?.message || "Update failed" }, { status: 500 });
  }
}

// PUT: Real-time Photo Moderation (Approve/Hide/Delete photo from viewer screen)
export async function PUT(req: NextRequest) {
  try {
    const { mediaId, isApproved, isDeleted } = await req.json();

    if (!mediaId) {
      return NextResponse.json({ success: false, message: "Media ID required" }, { status: 400 });
    }

    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isDeleted !== undefined && { isDeleted }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Media status synced with viewer screen!",
      media: updatedMedia,
    });
  } catch (error: any) {
    console.error("MEDIA_MODERATION_ERR:", error);
    return NextResponse.json({ success: false, message: error?.message || "Moderation failed" }, { status: 500 });
  }
}