import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get("slug") || searchParams.get("event") || "";
    const slug = rawSlug.trim().replace(/[^a-zA-Z0-9-_]/g, "");

    const prisma = getPrisma();
    let event = null;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Event slug or ID is required" },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    event = await prisma.event.findFirst({
      where: { OR: [{ slug }, { id: slug }], isDeleted: false },
      include: {
        settings: true,
        timelines: true,
        customFields: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      let val: any = cf.fieldValue;
      if (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      customMap[cf.fieldName] = val;
    }

    // Family members
    let familyMembers: any[] = [];
    const possibleFamilyKeys = ["familyMembers", "keyPeople", "vips", "teamAndFamily", "members"];
    for (const k of possibleFamilyKeys) {
      const candidate = customMap[k];
      if (Array.isArray(candidate) && candidate.length > 0) {
        familyMembers = candidate;
        break;
      } else if (typeof candidate === "string" && candidate.trim()) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0) {
            familyMembers = parsed;
            break;
          }
        } catch {}
      }
    }

    // Categories
    let categoriesList: string[] = [];
    const possibleCategoryKeys = ["photoCategories", "categories", "activeCategories", "unifiedCategories", "categoriesList"];
    for (const key of possibleCategoryKeys) {
      const candidate = customMap[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        categoriesList = candidate.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
        break;
      } else if (typeof candidate === "string" && candidate.trim()) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0) {
            categoriesList = parsed.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
            break;
          }
        } catch {
          categoriesList = candidate.split(",").map(c => c.trim()).filter(Boolean);
          if (categoriesList.length > 0) break;
        }
      }
    }

    // Slideshow Photos parsing
    let highlightPhotos: string[] = [];
    const rawPhotos = customMap["highlightPhotos"];
    if (Array.isArray(rawPhotos)) {
      highlightPhotos = rawPhotos.filter(Boolean);
    } else if (typeof rawPhotos === "string" && rawPhotos.trim()) {
      try {
        const parsed = JSON.parse(rawPhotos);
        if (Array.isArray(parsed)) highlightPhotos = parsed.filter(Boolean);
      } catch {}
    }

    // Music Tracks parsing
    let musicTracks: any[] = [];
    const rawMusic = customMap["musicTracks"] || customMap["playlist"];
    if (Array.isArray(rawMusic)) {
      musicTracks = rawMusic;
    } else if (typeof rawMusic === "string" && rawMusic.trim()) {
      try {
        const parsed = JSON.parse(rawMusic);
        if (Array.isArray(parsed)) musicTracks = parsed;
      } catch {}
    }

    // Default sample tracks if music enabled but list empty
    const musicEnabled = customMap["musicEnabled"] === true || customMap["musicEnabled"] === "true" || customMap["showMusic"] === true || customMap["showMusic"] === "true";
    if (musicTracks.length === 0 && musicEnabled) {
      musicTracks = [
        { id: 1, title: "Royal Wedding Shehnai", artist: "Classical Celebration", url: "https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg" },
        { id: 2, title: "Acoustic Romantic Melodies", artist: "Live Strings", url: "https://actions.google.com/sounds/v1/water/rain_heavy.ogg" }
      ];
    }

    const inviteData = {
      badgeTitle: customMap["topBadgeTitle"] || customMap["topBadge"] || customMap["badgeTitle"] || "OFFICIAL INVITATION",
      initials: customMap["initials"] || customMap["coupleNames"] || customMap["names"] || event.title || "A & S",
      tagline: customMap["tagline"] || event.settings?.subtitle || customMap["subtitle"] || "Together Forever",
      invitationMessage: customMap["invitationMessage"] || customMap["message"] || customMap["inviteMessage"] || "We cordially invite you to celebrate this special occasion with us.",
      displayDateText: customMap["displayDateText"] || customMap["dateText"] || "",
      displayTimeText: customMap["displayTimeText"] || customMap["timeText"] || "",
      displayVenueText: customMap["displayVenueText"] || customMap["venueText"] || event.location || customMap["venueName"] || "",
    };

    const res = NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.settings?.subtitle || customMap["subtitle"] || "",
        location: event.location || customMap["venueName"] || "",
        eventDate: event.eventDate,
        highlightType: customMap["highlightType"] || "video",
        highlightVideoUrl: customMap["highlightVideoUrl"] || "",
        highlightPhotos,
        ceremonyName: customMap["ceremonyName"] || "Main Ceremony",
        ourStoryUrl: customMap["ourStoryUrl"] || "",
        musicEnabled,
        musicTracks,
        timelines: customMap["timelines"] || event.timelines || [],
        photoCategories: categoriesList,
        categoriesList,
        familyMembers,
        inviteData,
        customMap,
      },
    });

    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  } catch (err: any) {
    console.error("EVENT_DATA_API_ERROR:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal Error" }, { status: 500 });
  }
}