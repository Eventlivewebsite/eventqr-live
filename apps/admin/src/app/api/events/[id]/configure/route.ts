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
      return NextResponse.json(
        { success: false, error: "Event ID required" },
        { status: 400 }
      );
    }

    const event: any = await prisma.event.findUnique({
      where: { id: cleanId },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timeline: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Safe normalization to prevent TypeScript 'never' errors
    const rawAlbums: any[] = Array.isArray(event.albums) ? event.albums : [];
    const rawTimeline: any[] = Array.isArray(event.timeline)
      ? event.timeline
      : Array.isArray(event.timelines)
      ? event.timelines
      : [];

    const defaultData = {
      heroTag: "LIVE EVENT",
      initials: "A & S WEDDING",
      welcomeHeading: event.title || "A & S Wedding",
      welcomeSubtext: event.settings?.subtitle || "Forever Begins Today",
      venueName: event.location || "Jaipur Palace",
      activeCeremony: "Wedding Reception",
      ceremonyStartTime: "18:00",
      storyVideoUrl: event.settings?.storyVideoUrl || "",
      highlightUrl: event.settings?.highlightUrl || "",
      categories:
        rawAlbums.length > 0
          ? rawAlbums.map((a: any) => a.title)
          : [
              "Ceremony",
              "Haldi",
              "Mehendi",
              "Reception",
              "Family",
              "Party",
            ],
      albums:
        rawAlbums.length > 0
          ? rawAlbums.map((a: any) => ({
              name: a.title,
              count: 0,
            }))
          : [
              { name: "Wedding", count: 120 },
              { name: "Haldi", count: 85 },
              { name: "Reception", count: 210 },
            ],
      decorationZones: [
        "Wedding Stage",
        "Floral Decoration",
        "Lighting",
        "Entrance",
        "Dining",
        "Selfie Booth",
      ],
      timeline:
        rawTimeline.length > 0
          ? rawTimeline.map((t: any) => ({
              title: t.title,
              time: t.timeText || t.time || "TBD",
              status: t.statusText || t.status || "UPCOMING",
            }))
          : [
              { title: "Wedding Reception", time: "06:00 PM", status: "LIVE" },
              { title: "Dinner", time: "08:00 PM", status: "UPCOMING" },
              { title: "Haldi Ceremony", time: "11:00 AM", status: "COMPLETED" },
            ],
    };

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        status: event.status,
        ...defaultData,
      },
    });
  } catch (error: any) {
    console.error("GET /configure error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
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
    const body = await req.json().catch(() => null);

    if (!cleanId || !body) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const finalTitle = String(
      body.welcomeHeading || body.title || "Celebration"
    ).trim();
    const finalSubtitle = String(
      body.welcomeSubtext || "Forever Begins Today"
    ).trim();

    await prisma.$transaction(async (tx: any) => {
      // 1. Update Core Event fields matching schema
      const updateData: Record<string, any> = {
        title: finalTitle,
      };

      if (body.venueName && "location" in tx.event.fields) {
        updateData.location = String(body.venueName).trim();
      }

      await tx.event.update({
        where: { id: cleanId },
        data: updateData,
      });

      // 2. Update EventSettings
      await tx.eventSettings.upsert({
        where: { eventId: cleanId },
        update: {
          subtitle: finalSubtitle,
          storyVideoUrl: body.storyVideoUrl || undefined,
          highlightUrl: body.highlightUrl || undefined,
        },
        create: {
          eventId: cleanId,
          subtitle: finalSubtitle,
          storyVideoUrl: body.storyVideoUrl || undefined,
          highlightUrl: body.highlightUrl || undefined,
        },
      });

      // 3. Sync Categories to Albums
      const categories: string[] = Array.isArray(body.categories)
        ? body.categories
        : [];

      for (let i = 0; i < categories.length; i++) {
        const cat = String(categories[i]).trim();
        if (!cat) continue;
        const slug = cat
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        const existing = await tx.album.findFirst({
          where: { eventId: cleanId, slug },
        });

        if (!existing) {
          await tx.album.create({
            data: {
              eventId: cleanId,
              title: cat,
              slug,
              sortOrder: i,
            },
          });
        } else {
          await tx.album.update({
            where: { id: existing.id },
            data: {
              title: cat,
              sortOrder: i,
            },
          });
        }
      }

      // 4. Sync Timeline
      if (Array.isArray(body.timeline)) {
        await tx.eventTimeline.deleteMany({
          where: { eventId: cleanId },
        });

        for (let i = 0; i < body.timeline.length; i++) {
          const t = body.timeline[i];
          if (!t?.title) continue;

          await tx.eventTimeline.create({
            data: {
              eventId: cleanId,
              title: String(t.title).trim(),
              timeText: String(t.time || "TBD").trim(),
              statusText: String(t.status || "UPCOMING").trim(),
              sortOrder: i,
            },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Viewer settings updated successfully!",
    });
  } catch (error: any) {
    console.error("POST /configure error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to deploy configuration" },
      { status: 500 }
    );
  }
}