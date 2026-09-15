import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    let parsedConfig: any = {};
    if (event.customCategories) {
      try {
        parsedConfig = typeof event.customCategories === "string" 
          ? JSON.parse(event.customCategories) 
          : event.customCategories;
      } catch {
        parsedConfig = {};
      }
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
        venueName: event.venueName || parsedConfig.venueName || "Jaipur Palace",
        heroTag: parsedConfig.heroTag || "LIVE EVENT",
        welcomeHeading: event.welcomeHeading || parsedConfig.welcomeHeading || event.name || "Celebration",
        welcomeSubtext: event.welcomeSubtext || parsedConfig.welcomeSubtext || "Forever Begins Today",
        activeCeremony: parsedConfig.activeCeremony || "Wedding Reception",
        ceremonyStartTime: parsedConfig.ceremonyStartTime || "18:00",
        themeColor: event.themeColor || "ROSE_GOLD",
        categories: parsedConfig.categories || [],
        albums: parsedConfig.albums || [],
        timeline: parsedConfig.timeline || [],
        menuItems: parsedConfig.menuItems || [],
        decorationZones: parsedConfig.decorationZones || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Server Error" }, { status: 500 });
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

    const dynamicConfig = {
      heroTag: body.heroTag,
      welcomeHeading: body.welcomeHeading,
      welcomeSubtext: body.welcomeSubtext,
      activeCeremony: body.activeCeremony,
      ceremonyStartTime: body.ceremonyStartTime,
      venueName: body.venueName,
      categories: body.categories,
      albums: body.albums,
      timeline: body.timeline,
      menuItems: body.menuItems,
      decorationZones: body.decorationZones,
    };

    const updated = await (prisma.event as any).update({
      where: { id: cleanId },
      data: {
        name: body.welcomeHeading || body.name,
        eventType: body.type,
        venueName: body.venueName,
        welcomeHeading: body.welcomeHeading,
        welcomeSubtext: body.welcomeSubtext,
        themeColor: body.themeColor,
        customCategories: JSON.stringify(dynamicConfig),
        isLive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Viewer configurations successfully deployed!",
      event: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || "Failed to update configuration" }, { status: 500 });
  }
}