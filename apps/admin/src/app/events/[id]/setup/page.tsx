import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PRESETS: Record<string, any> = {
  WEDDING: {
    badge: "LIVE WEDDING EVENT",
    defaultHeading: "A & S Wedding Celebration",
    defaultSubtext: "Forever Begins Today",
    venue: "Jaipur Palace, Ballroom",
    activeCeremony: "Wedding Reception",
    ceremonyTime: "06:00 PM",
    categories: ["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party"],
    albums: [
      { name: "Wedding", count: 120 },
      { name: "Haldi", count: 85 },
      { name: "Reception", count: 210 },
    ],
    decorationZones: ["Wedding Stage", "Floral Decoration", "Lighting", "Entrance", "Dining", "Selfie Booth"],
    timeline: [
      { title: "Haldi Ceremony", time: "11:00 AM", status: "COMPLETED" },
      { title: "Wedding Reception", time: "06:00 PM", status: "LIVE" },
      { title: "Dinner", time: "08:00 PM", status: "UPCOMING" },
    ],
  },
  BIRTHDAY: {
    badge: "BIRTHDAY BASH LIVE",
    defaultHeading: "Aarav's 1st Birthday Fiesta",
    defaultSubtext: "One Year of Pure Joy",
    venue: "Grand Celebration Hall",
    activeCeremony: "Cake Cutting Ceremony",
    ceremonyTime: "06:30 PM",
    categories: ["Cake Cutting", "Magic Show", "Kids Zone", "Family Moments", "Dance Party"],
    albums: [
      { name: "Cake Cutting", count: 45 },
      { name: "Kids Zone", count: 90 },
    ],
    decorationZones: ["Balloon Arch", "Cake Stage", "Kids Play Area", "Selfie Backdrop"],
    timeline: [
      { title: "Cake Cutting", time: "06:30 PM", status: "LIVE" },
    ],
  },
  CORPORATE: {
    badge: "GLOBAL SUMMIT 2026",
    defaultHeading: "Tech Leadership Summit",
    defaultSubtext: "Innovate, Lead, Transform",
    venue: "Convention Center, Bangalore",
    activeCeremony: "Keynote Address",
    ceremonyTime: "10:30 AM",
    categories: ["Keynote", "Workshops", "Awards Gala", "Networking", "Dinner"],
    albums: [{ name: "Keynote Stage", count: 80 }],
    decorationZones: ["Main Stage", "VIP Registration", "Dining Hall"],
    timeline: [{ title: "Keynote Address", time: "10:30 AM", status: "LIVE" }],
  },
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "Event ID required" }, { status: 400 });
    }

    const event: any = await prisma.event.findUnique({
      where: { id: cleanId },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timelines: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const evType = String(event.type || "WEDDING").toUpperCase();
    const preset = PRESETS[evType] || PRESETS.WEDDING;

    const dbAlbums: any[] = Array.isArray(event.albums) ? event.albums : [];
    const dbTimeline: any[] = Array.isArray(event.timelines)
      ? event.timelines
      : Array.isArray(event.timeline)
      ? event.timeline
      : [];

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug || "event-" + event.id.slice(-6),
        type: event.type || "WEDDING",
        status: event.status || "APPROVED",
        heroTag: preset.badge,
        welcomeHeading: event.title || preset.defaultHeading,
        welcomeSubtext: event.settings?.subtitle || preset.defaultSubtext,
        venueName: event.location || preset.venue,
        activeCeremony: preset.activeCeremony,
        ceremonyStartTime: preset.ceremonyTime,
        accessMode: "PUBLIC",
        pinCode: "",
        retentionDays: 15,
        autoCompress: true,
        allowDownloads: event.settings?.allowDownloads ?? true,
        allowComments: event.settings?.allowLikes ?? true,
        categories: dbAlbums.length > 0 ? dbAlbums.map((a: any) => a.title) : preset.categories,
        albums: dbAlbums.length > 0 ? dbAlbums.map((a: any) => ({ name: a.title, count: 0 })) : preset.albums,
        decorationZones: preset.decorationZones,
        timeline: dbTimeline.length > 0
          ? dbTimeline.map((t: any) => ({
              title: t.title,
              time: t.timeText || t.time || "TBD",
              status: t.statusText || t.status || "UPCOMING",
            }))
          : preset.timeline,
      },
    });
  } catch (error: any) {
    console.error("GET /configure error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const finalTitle = String(body.welcomeHeading || body.title || "Celebration").trim();
    const finalSubtitle = String(body.welcomeSubtext || "Forever Begins Today").trim();

    await prisma.$transaction(async (tx: any) => {
      // 1. Update Core Event Title & Location
      const eventUpdateData: Record<string, any> = { title: finalTitle };
      if (body.venueName) {
        eventUpdateData.location = String(body.venueName).trim();
      }

      await tx.event.update({
        where: { id: cleanId },
        data: eventUpdateData,
      });

      // 2. Update Settings (Downloads & Comments)
      const settingsData = {
        subtitle: finalSubtitle,
        allowDownloads: Boolean(body.allowDownloads ?? true),
        allowLikes: Boolean(body.allowComments ?? true),
      };

      await tx.eventSettings.upsert({
        where: { eventId: cleanId },
        update: settingsData,
        create: { eventId: cleanId, ...settingsData },
      });

      // 3. Sync Categories to Albums
      const categories: string[] = Array.isArray(body.categories) ? body.categories : [];
      for (let i = 0; i < categories.length; i++) {
        const cat = String(categories[i]).trim();
        if (!cat) continue;
        const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

        const existing = await tx.album.findFirst({ where: { eventId: cleanId, slug } });
        if (!existing) {
          await tx.album.create({ data: { eventId: cleanId, title: cat, slug, sortOrder: i } });
        } else {
          await tx.album.update({ where: { id: existing.id }, data: { title: cat, sortOrder: i } });
        }
      }

      // 4. Sync Timeline
      if (Array.isArray(body.timeline)) {
        await tx.eventTimeline.deleteMany({ where: { eventId: cleanId } });
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

    return NextResponse.json({ success: true, message: "Viewer configurations successfully deployed!" });
  } catch (error: any) {
    console.error("POST /configure error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}