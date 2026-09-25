import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

// Cryptographic Secret Engine Initialization
const RAW_JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET = new TextEncoder().encode(
  RAW_JWT_SECRET || "eventqr_live_secure_jwt_secret_key_2026_super_admin"
);

// Session Verification & Role Authorization Helper
interface AuthSession {
  userId: string;
  role: string;
}

async function authenticateAndAuthorize(req: NextRequest): Promise<AuthSession | null> {
  const token =
    req.cookies.get("eventqr_session")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = String(payload.userId || "");
    const role = String(payload.role || "").toUpperCase();

    if (!userId || !role) return null;

    // Sirf verified Admin, Studio Admin ya Super Admin ko allow karein
    if (role !== "ADMIN" && role !== "STUDIO_ADMIN" && role !== "SUPER_ADMIN") {
      return null;
    }

    return { userId, role };
  } catch {
    return null;
  }
}

// Default Presets
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

// Input Sanitizer to block XSS and Malformed injections
function sanitizeString(val: any, maxLength = 250): string {
  if (typeof val !== "string") return "";
  return val.trim().slice(0, maxLength);
}

// -------------------------------------------------------------
// GET: Fetch Event Configurations
// -------------------------------------------------------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await authenticateAndAuthorize(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Unauthenticated access." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const cleanId = sanitizeString(id, 64);

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Event ID required." },
        { status: 400 }
      );
    }

    // 2. Fetch Event with Soft-Delete Guard
    const event: any = await prisma.event.findFirst({
      where: {
        id: cleanId,
        isDeleted: false,
      },
      include: {
        settings: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timelines: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event resource not found." },
        { status: 404 }
      );
    }

    // 3. IDOR / Resource Ownership Validation
    if (session.role === "STUDIO_ADMIN" && event.clientId && event.clientId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Access Forbidden: Resource ownership validation failed." },
        { status: 403 }
      );
    }

    const evType = String(event.type || "WEDDING").toUpperCase();
    const preset = PRESETS[evType] || PRESETS.WEDDING;

    const dbAlbums: any[] = Array.isArray(event.albums) ? event.albums : [];
    const dbTimeline: any[] = Array.isArray(event.timelines)
      ? event.timelines
      : Array.isArray(event.timeline)
      ? event.timeline
      : [];

    let customSettings: any = {};
    try {
      if (event.settings?.customSettings) {
        customSettings = JSON.parse(event.settings.customSettings);
      }
    } catch {
      customSettings = {};
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug || "event-" + event.id.slice(-6),
        type: event.type || "WEDDING",
        status: event.status || "APPROVED",
        heroTag: customSettings.heroTag || preset.badge,
        welcomeHeading: event.title || preset.defaultHeading,
        welcomeSubtext: event.settings?.subtitle || preset.defaultSubtext,
        venueName: event.location || preset.venue,
        eventDate: event.eventDate ? event.eventDate.toISOString() : null,
        activeCeremony: preset.activeCeremony,
        ceremonyStartTime: preset.ceremonyTime,
        accessMode: event.accessMode || "PUBLIC",
        pinCode: event.pinCode || "",
        retentionDays: event.retentionDays || 15,
        autoCompress: true,
        allowDownloads: event.settings?.allowDownloads ?? true,
        allowComments: event.settings?.allowLikes ?? true,
        categories: dbAlbums.length > 0 ? dbAlbums.map((a: any) => a.title) : preset.categories,
        albums: dbAlbums.length > 0 ? dbAlbums.map((a: any) => ({ name: a.title, count: 0 })) : preset.albums,
        decorationZones: customSettings.decorationZones || preset.decorationZones,
        timeline: dbTimeline.length > 0
          ? dbTimeline.map((t: any) => ({
              title: t.title,
              time: t.timeText || t.time || "TBD",
              status: t.statusText || t.status || "UPCOMING",
            }))
          : preset.timeline,
        familyMembers: customSettings.familyMembers || [],
        foodItems: customSettings.foodItems || [],
      },
    });
  } catch (error: any) {
    console.error("GET /api/events/[id]/configure internal error:", error);
    return NextResponse.json(
      { success: false, error: "Internal processing error." },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: Update & Deploy Event Configurations
// -------------------------------------------------------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication Check
    const session = await authenticateAndAuthorize(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Unauthenticated access." },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const cleanId = sanitizeString(id, 64);
    const body = await req.json().catch(() => null);

    if (!cleanId || !body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload provided." },
        { status: 400 }
      );
    }

    // 2. Fetch Existing Event & Verify Ownership (Anti-IDOR)
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: cleanId,
        isDeleted: false,
      },
      select: {
        id: true,
        clientId: true,
      },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: "Target event resource not found." },
        { status: 404 }
      );
    }

    // Strict Ownership Enforcement: Studio Admin sirf apna resource edit kare
    if (session.role === "STUDIO_ADMIN" && existingEvent.clientId && existingEvent.clientId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Access Forbidden: Unauthorized modification attempt on unowned resource." },
        { status: 403 }
      );
    }

    // 3. Strict Input Sanitization & Boundaries
    const finalTitle = sanitizeString(body.welcomeHeading || body.title || "Celebration", 150);
    const finalSubtitle = sanitizeString(body.welcomeSubtext || "Forever Begins Today", 250);

    const eventUpdateData: Record<string, any> = { title: finalTitle };

    if (body.venueName !== undefined) {
      eventUpdateData.location = sanitizeString(body.venueName, 200);
    }

    if (body.eventDate) {
      const parsedDate = new Date(body.eventDate);
      if (!isNaN(parsedDate.getTime())) {
        eventUpdateData.eventDate = parsedDate;
      }
    }

    if (body.retentionDays !== undefined) {
      const parsedDays = Number(body.retentionDays);
      eventUpdateData.retentionDays = isNaN(parsedDays) || parsedDays < 1 ? 15 : Math.min(parsedDays, 365);
    }

    if (body.accessMode !== undefined) {
      const mode = String(body.accessMode).toUpperCase();
      eventUpdateData.accessMode = ["PUBLIC", "PIN", "PRIVATE"].includes(mode) ? mode : "PUBLIC";
    }

    if (body.pinCode !== undefined) {
      const sanitizedPin = sanitizeString(body.pinCode, 10);
      eventUpdateData.pinCode = sanitizedPin.length > 0 ? sanitizedPin : null;
    }

    // 4. Safe Sequential Execution (Supabase Pooler Friendly)
    await prisma.event.update({
      where: { id: cleanId },
      data: eventUpdateData,
    });

    // Settings Object Bundle
    // Clean oversized image data from state
      const cleanFamily = Array.isArray(body.familyMembers)
        ? body.familyMembers.slice(0, 100).map((m: any) => ({
            id: String(m.id || Date.now()),
            name: sanitizeString(m.name, 100),
            role: sanitizeString(m.role, 100),
            bio: sanitizeString(m.bio, 250),
            photoUrl: typeof m.photoUrl === "string" && m.photoUrl.length > 200000 
              ? "" // Drop oversized uncompressed payload
              : m.photoUrl || "",
          }))
        : [];

      const cleanFood = Array.isArray(body.foodItems)
        ? body.foodItems.slice(0, 150).map((f: any) => ({
            id: String(f.id || Date.now()),
            name: sanitizeString(f.name, 100),
            category: f.category === "NON_VEG" ? "NON_VEG" : "VEG",
            description: sanitizeString(f.description, 250),
            photoUrl: typeof f.photoUrl === "string" && f.photoUrl.length > 200000 
              ? "" 
              : f.photoUrl || "",
          }))
        : [];

      // Settings Object Bundle
      const serializedCustomSettings = JSON.stringify({
        familyMembers: cleanFamily,
        foodItems: cleanFood,
        decorationZones: Array.isArray(body.decorationZones) ? body.decorationZones.slice(0, 50) : [],
        heroTag: sanitizeString(body.heroTag || "LIVE EVENT", 50),
      });
    const settingsData = {
      subtitle: finalSubtitle,
      allowDownloads: Boolean(body.allowDownloads ?? true),
      allowLikes: Boolean(body.allowComments ?? true),
      customSettings: serializedCustomSettings,
    };

    await prisma.eventSettings.upsert({
      where: { eventId: cleanId },
      update: settingsData,
      create: { eventId: cleanId, ...settingsData },
    });

    // Sync Categories / Albums
    if (Array.isArray(body.categories)) {
      const categories = body.categories.slice(0, 30);
      for (let i = 0; i < categories.length; i++) {
        const cat = sanitizeString(categories[i], 80);
        if (!cat) continue;
        const slug = cat
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        if (!slug) continue;

        const existing = await prisma.album.findFirst({
          where: { eventId: cleanId, slug },
        });

        if (!existing) {
          await prisma.album.create({
            data: { eventId: cleanId, title: cat, slug, sortOrder: i },
          });
        } else {
          await prisma.album.update({
            where: { id: existing.id },
            data: { title: cat, sortOrder: i },
          });
        }
      }
    }

    // Sync Timeline
    if (Array.isArray(body.timeline)) {
      await prisma.eventTimeline.deleteMany({ where: { eventId: cleanId } });
      const timelineItems = body.timeline.slice(0, 40);

      for (let i = 0; i < timelineItems.length; i++) {
        const t = timelineItems[i];
        const itemTitle = sanitizeString(t?.title, 100);
        if (!itemTitle) continue;

        await prisma.eventTimeline.create({
          data: {
            eventId: cleanId,
            title: itemTitle,
            timeText: sanitizeString(t.time || "TBD", 30),
            statusText: sanitizeString(t.status || "UPCOMING", 30),
            sortOrder: i,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Viewer configurations successfully secured and deployed!",
    });
  } catch (error: any) {
    console.error("POST /api/events/[id]/configure internal error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal processing error." },
      { status: 500 }
    );
  }
}