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

    if (!cleanId || !/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Event ID format" },
        { status: 400 }
      );
    }

    const event: any = await (prisma.event as any).findUnique({
      where: { id: cleanId },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
        timelines: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Dynamic config fallback (if customCategories exists)
    let parsedConfig: any = {};
    if (event.customCategories) {
      try {
        parsedConfig =
          typeof event.customCategories === "string"
            ? JSON.parse(event.customCategories)
            : event.customCategories;
      } catch {
        parsedConfig = {};
      }
    }

    // Safe extraction to prevent 'never' map errors
    const rawAlbums: any[] = Array.isArray(event.albums)
      ? event.albums
      : Array.isArray(parsedConfig.albums)
      ? parsedConfig.albums
      : [];

    const rawTimeline: any[] = Array.isArray(event.timeline)
      ? event.timeline
      : Array.isArray(event.timelines)
      ? event.timelines
      : Array.isArray(parsedConfig.timeline)
      ? parsedConfig.timeline
      : [];

    const categoriesFromAlbums = rawAlbums.map((a: any) =>
      typeof a === "string" ? a : a.title || a.name
    );

    const finalCategories =
      categoriesFromAlbums.length > 0
        ? categoriesFromAlbums
        : Array.isArray(parsedConfig.categories) && parsedConfig.categories.length > 0
        ? parsedConfig.categories
        : ["Ceremony", "Haldi", "Mehendi", "Reception"];

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.title || event.name || "",
        title: event.title || event.name || "",
        slug: event.slug,
        type: event.type || event.eventType || parsedConfig.type || "WEDDING",
        eventDate: event.eventDate
          ? new Date(event.eventDate).toISOString().split("T")[0]
          : event.createdAt
          ? new Date(event.createdAt).toISOString().split("T")[0]
          : "",
        isLive: Boolean(event.isLive ?? (event.status === "ACTIVE")),
        status: event.status || "ACTIVE",
        venueName:
          event.location ||
          event.venueName ||
          parsedConfig.venueName ||
          "Grand Palace",
        heroTag: parsedConfig.heroTag || "LIVE EVENT",
        welcomeHeading:
          event.welcomeHeading ||
          parsedConfig.welcomeHeading ||
          event.title ||
          event.name ||
          "Celebration",
        welcomeSubtext:
          event.settings?.subtitle ||
          event.welcomeSubtext ||
          parsedConfig.welcomeSubtext ||
          "Forever Begins Today",
        activeCeremony: parsedConfig.activeCeremony || "Wedding Reception",
        ceremonyStartTime: parsedConfig.ceremonyStartTime || "18:00",
        themeColor: event.themeColor || parsedConfig.themeColor || "ROSE_GOLD",
        categories: finalCategories,
        albums: rawAlbums.map((a: any) => ({
          name: typeof a === "string" ? a : a.title || a.name || "Album",
          count: a.count ?? 0,
        })),
        timeline: rawTimeline.map((t: any) => ({
          title: t.title || "Ceremony",
          time: t.timeText || t.time || "TBD",
          status: t.statusText || t.status || "UPCOMING",
        })),
        menuItems: parsedConfig.menuItems || [
          "Premium Invitation",
          "Guest Book",
          "Food Menu",
        ],
        decorationZones: parsedConfig.decorationZones || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/events/[id]/configure error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Server Error" },
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

    if (!cleanId || !/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
      return NextResponse.json(
        { success: false, error: "Invalid or tampered Event ID format" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request payload" },
        { status: 400 }
      );
    }

    const finalTitle = String(
      body.welcomeHeading || body.title || body.name || "Celebration"
    ).trim();
    const finalSubtitle = String(
      body.welcomeSubtext || "Forever Begins Today"
    ).trim();
    const finalLocation = body.venueName ? String(body.venueName).trim() : null;

    // Build Schema-locked fields payload (Only allowed fields in Event table)
    const eventUpdateData: Record<string, any> = {
      title: finalTitle,
    };

    if (finalLocation) {
      eventUpdateData.location = finalLocation;
    }

    // Atomic transaction for database consistency
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Update Core Event Table
      const updatedEvent = await tx.event.update({
        where: { id: cleanId },
        data: eventUpdateData,
      });

      // 2. Upsert Subtitle into EventSettings Table
      await tx.eventSettings.upsert({
        where: { eventId: cleanId },
        update: {
          subtitle: finalSubtitle,
        },
        create: {
          eventId: cleanId,
          subtitle: finalSubtitle,
          showCountdown: true,
          showHighlights: true,
          showTrending: true,
          showTimeline: true,
          allowDownloads: true,
          allowLikes: true,
        },
      });

      // 3. Sync Categories and Albums to Album Table
      const rawCategories: string[] =
        Array.isArray(body.categories) && body.categories.length > 0
          ? body.categories
          : Array.isArray(body.albums)
          ? body.albums.map((a: any) => (typeof a === "string" ? a : a.name))
          : [];

      const cleanCategories = rawCategories
        .map((c) => String(c || "").trim())
        .filter(Boolean);

      if (cleanCategories.length > 0) {
        for (let i = 0; i < cleanCategories.length; i++) {
          const catTitle = cleanCategories[i];
          const catSlug = catTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          const existingAlbum = await tx.album.findFirst({
            where: { eventId: cleanId, slug: catSlug },
          });

          if (!existingAlbum) {
            await tx.album.create({
              data: {
                eventId: cleanId,
                title: catTitle,
                slug: catSlug,
                sortOrder: i,
              },
            });
          } else {
            await tx.album.update({
              where: { id: existingAlbum.id },
              data: {
                title: catTitle,
                sortOrder: i,
              },
            });
          }
        }
      }

      // 4. Sync Timeline Schedule (EventTimeline Table)
      if (Array.isArray(body.timeline)) {
        await tx.eventTimeline.deleteMany({
          where: { eventId: cleanId },
        });

        for (let i = 0; i < body.timeline.length; i++) {
          const item = body.timeline[i];
          if (!item?.title) continue;

          await tx.eventTimeline.create({
            data: {
              eventId: cleanId,
              title: String(item.title).trim(),
              timeText: String(item.time || "TBD").trim(),
              statusText: String(item.status || "UPCOMING").trim(),
              sortOrder: i,
            },
          });
        }
      }

      return updatedEvent;
    });

    return NextResponse.json({
      success: true,
      message: "Viewer configurations successfully deployed!",
      event: result,
    });
  } catch (error: any) {
    console.error("POST /api/events/[id]/configure error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to update configuration",
      },
      { status: 500 }
    );
  }
}