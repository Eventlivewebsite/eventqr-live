import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    const event = await (prisma.event as any).findUnique({
      where: { id: cleanId },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name || event.title || "",
        slug: event.slug,
        type: event.eventType || event.type || "WEDDING",
        eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
        isLive: Boolean(event.isLive),
        status: event.status || "APPROVED",
        isPublic: event.isPublic ?? true,
        venueName: event.venueName || "",
        venueAddress: event.venueAddress || "",
        locationUrl: event.locationUrl || "",
        welcomeHeading: event.welcomeHeading || `Welcome to ${event.name || "Our Celebration"}`,
        welcomeSubtext: event.welcomeSubtext || "Scan the QR code to post your photos to the live wall!",
        themeColor: event.themeColor || "ROSE_GOLD",
        slideshowSpeedSeconds: event.slideshowSpeedSeconds || 5,
        moderationEnabled: event.moderationEnabled ?? true,
        allowVideoUploads: event.allowVideoUploads ?? false,
        allowGuestDownloads: event.allowGuestDownloads ?? true,
        showQrOnScreen: event.showQrOnScreen ?? true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch event" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();
    const body = await req.json();

    const updateData: any = {
      isLive: true,
      status: "APPROVED",
    };

    if (body.name) updateData.name = String(body.name).trim();
    if (body.eventDate) updateData.eventDate = new Date(body.eventDate);

    // Dynamic optional field assignment (prevent schema mismatch crashes)
    const optionalFields = [
      "eventType",
      "venueName",
      "venueAddress",
      "locationUrl",
      "welcomeHeading",
      "welcomeSubtext",
      "themeColor",
      "slideshowSpeedSeconds",
      "moderationEnabled",
      "allowVideoUploads",
      "allowGuestDownloads",
      "showQrOnScreen",
      "isPublic",
    ];

    optionalFields.forEach((field) => {
      const bodyKey = field === "eventType" ? "type" : field;
      if (body[bodyKey] !== undefined) {
        updateData[field] = body[bodyKey];
      }
    });

    const updated = await (prisma.event as any).update({
      where: { id: cleanId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Event configured and live broadcast activated!",
      event: updated,
    });
  } catch (error: any) {
    console.error("[CONFIGURE_SAVE_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to persist configuration" },
      { status: 500 }
    );
  }
}