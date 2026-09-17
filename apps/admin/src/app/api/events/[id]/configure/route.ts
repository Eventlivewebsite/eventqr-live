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

    const event = await (prisma.event as any).findUnique({
      where: { id: cleanId },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timelines: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const rawAlbums: any[] = Array.isArray(event.albums) ? event.albums : [];
    const rawTimeline: any[] = Array.isArray(event.timelines)
      ? event.timelines
      : Array.isArray(event.timeline)
      ? event.timeline
      : [];

    const categories = rawAlbums.map((a: any) => a.title);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.title,
        title: event.title,
        slug: event.slug,
        type: event.type || "WEDDING",
        eventDate: event.createdAt
          ? new Date(event.createdAt).toISOString().split("T")[0]
          : "",
        isLive: event.status === "ACTIVE",
        status: event.status || "ACTIVE",
        venueName: event.location || "Main Venue",
        heroTag: "LIVE EVENT",
        welcomeHeading: event.title,
        welcomeSubtext: event.settings?.subtitle || "Forever Begins Today",
        activeCeremony: "Wedding Reception",
        ceremonyStartTime: "18:00",
        themeColor: "#9333EA",
        categories:
          categories.length > 0
            ? categories
            : ["Ceremony", "Haldi", "Mehendi", "Reception"],
        albums: rawAlbums.map((a: any) => ({
          name: a.title,
          count: 0,
        })),
        timeline: rawTimeline.map((t: any) => ({
          title: t.title,
          time: t.timeText || t.time || "TBD",
          status: t.statusText || t.status || "UPCOMING",
        })),
        menuItems: ["Premium Invitation", "Guest Book", "Food Menu"],
        decorationZones: [],
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
        { success: false, error: "Invalid or tampered Event ID" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const finalTitle = String(
      body.welcomeHeading || body.title || body.name || "Event"
    ).trim();
    const finalSubtitle = String(
      body.welcomeSubtext || "Forever Begins Today"
    ).trim();
    const finalLocation = body.venueName ? String(body.venueName).trim() : null;

    const result = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Update only schema fields in Event
      const updatedEvent = await tx.event.update({
        where: { id: cleanId },
        data: {
          title: finalTitle,
          ...(finalLocation && "location" in tx.event.fields
            ? { location: finalLocation }
            : {}),
        },
      });

      // 2. Upsert Subtitle into EventSettings
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

      // 3. Synchronize Categories & Albums into Album table
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

      // 4. Synchronize Programs into EventTimeline table
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