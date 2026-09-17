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

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: cleanId },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Dynamic config fallback extraction
    let parsedConfig: any = {};
    const rawCustom = (event as any).customCategories;
    if (rawCustom) {
      try {
        parsedConfig = typeof rawCustom === "string" ? JSON.parse(rawCustom) : rawCustom;
      } catch {
        parsedConfig = {};
      }
    }

    // Map relational albums directly to categories
    const albumCategories = event.albums?.map((a) => a.title) || [];
    const finalCategories = albumCategories.length > 0 
      ? albumCategories 
      : (parsedConfig.categories || ["Ceremony", "Haldi", "Mehendi", "Reception"]);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.title || (event as any).name || "",
        title: event.title,
        slug: event.slug,
        type: event.type || (event as any).eventType || "WEDDING",
        eventDate: (event as any).eventDate ? new Date((event as any).eventDate).toISOString().split("T")[0] : "",
        isLive: Boolean((event as any).isLive ?? (event.status === "ACTIVE")),
        status: event.status || "ACTIVE",
        venueName: (event as any).venueName || parsedConfig.venueName || "Grand Palace",
        heroTag: parsedConfig.heroTag || "LIVE EVENT",
        welcomeHeading: (event as any).welcomeHeading || parsedConfig.welcomeHeading || event.title || "Celebration",
        welcomeSubtext: event.settings?.subtitle || (event as any).welcomeSubtext || parsedConfig.welcomeSubtext || "Forever Begins Today",
        activeCeremony: parsedConfig.activeCeremony || "Wedding Reception",
        ceremonyStartTime: parsedConfig.ceremonyStartTime || "18:00",
        themeColor: (event as any).themeColor || "ROSE_GOLD",
        categories: finalCategories,
        albums: event.albums || parsedConfig.albums || [],
        timeline: event.timeline || parsedConfig.timeline || [],
        menuItems: parsedConfig.menuItems || ["Premium Invitation", "Guest Book", "Food Menu"],
        decorationZones: parsedConfig.decorationZones || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/events/[id]/configure error:", error);
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

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

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

    // 1. Update Core Event fields (Schema Compatible)
    const updatePayload: any = {
      title: body.welcomeHeading || body.title || body.name,
    };

    // Safely add optional fields if they exist in runtime DB
    if ("name" in prisma.event.fields) updatePayload.name = body.welcomeHeading || body.name;
    if ("welcomeHeading" in prisma.event.fields) updatePayload.welcomeHeading = body.welcomeHeading;
    if ("welcomeSubtext" in prisma.event.fields) updatePayload.welcomeSubtext = body.welcomeSubtext;
    if ("venueName" in prisma.event.fields) updatePayload.venueName = body.venueName;
    if ("themeColor" in prisma.event.fields) updatePayload.themeColor = body.themeColor;
    if ("isLive" in prisma.event.fields) updatePayload.isLive = true;
    if ("customCategories" in prisma.event.fields) {
      updatePayload.customCategories = JSON.stringify(dynamicConfig);
    }

    const updated = await (prisma.event as any).update({
      where: { id: cleanId },
      data: updatePayload,
    });

    // 2. Sync to EventSettings
    await prisma.eventSettings.upsert({
      where: { eventId: cleanId },
      update: {
        subtitle: body.welcomeSubtext || undefined,
      },
      create: {
        eventId: cleanId,
        subtitle: body.welcomeSubtext || "Forever Begins Today",
      },
    });

    // 3. Sync Categories to Album Table (for Guest Viewer category filtering)
    if (Array.isArray(body.categories) && body.categories.length > 0) {
      for (let i = 0; i < body.categories.length; i++) {
        const catTitle = String(body.categories[i]).trim();
        if (!catTitle) continue;
        const catSlug = catTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        const existing = await prisma.album.findFirst({
          where: { eventId: cleanId, slug: catSlug },
        });

        if (!existing) {
          await prisma.album.create({
            data: {
              eventId: cleanId,
              title: catTitle,
              slug: catSlug,
              sortOrder: i,
            },
          });
        } else {
          await prisma.album.update({
            where: { id: existing.id },
            data: { title: catTitle, sortOrder: i },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Viewer configurations and categories successfully deployed!",
      event: updated,
    });
  } catch (error: any) {
    console.error("POST /api/events/[id]/configure error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || "Failed to update configuration" 
    }, { status: 500 });
  }
}