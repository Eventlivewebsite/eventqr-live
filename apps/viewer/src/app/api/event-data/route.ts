import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

let cachedPrisma: PrismaClient | null = null;

function getPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!cachedPrisma) {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    cachedPrisma = new PrismaClient({ adapter });
  }
  return cachedPrisma;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event") || "testing-nns3";

    const prisma = getPrismaClient();
    if (!prisma) {
      return NextResponse.json({ success: false, error: "Database not connected" }, { status: 503 });
    }

    const event: any = await prisma.event.findFirst({
      where: {
        OR: [{ slug: String(slug) }, { id: String(slug) }],
      },
      include: {
        settings: true,
        customFields: true,
        albums: { orderBy: { sortOrder: "asc" } },
        timelines: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const customMap: Record<string, string> = {};
    if (Array.isArray(event.customFields)) {
      event.customFields.forEach((cf: any) => {
        customMap[cf.fieldName] = cf.fieldValue;
      });
    }

    // Check Publish Date
    const scheduledDateStr = customMap["scheduledPublishDate"];
    let isLocked = false;
    if (scheduledDateStr && !event.isLive) {
      const scheduledDate = new Date(scheduledDateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (scheduledDate > today) {
        isLocked = true;
      }
    }

    let highlightPhotos: string[] = [];
    let videoCategories: string[] = ["Highlights", "Ceremony", "Haldi", "Reception"];
    let videoDecorationCategories: string[] = ["Stage Decor", "Entry Gate"];
    let photoCategories: string[] = ["Ceremony", "Haldi", "Mehendi", "Reception"];
    let photoDecorationCategories: string[] = ["Flower Setup", "Photo Booth"];
    let timelines: any[] = [];
    let foodItems: any[] = [];
    let familyMembers: any[] = [];
    let playlist: any[] = [];

    try { if (customMap["highlightPhotos"]) highlightPhotos = JSON.parse(customMap["highlightPhotos"]); } catch {}
    try { if (customMap["videoCategories"]) videoCategories = JSON.parse(customMap["videoCategories"]); } catch {}
    try { if (customMap["videoDecorationCategories"]) videoDecorationCategories = JSON.parse(customMap["videoDecorationCategories"]); } catch {}
    try { if (customMap["photoCategories"]) photoCategories = JSON.parse(customMap["photoCategories"]); } catch {}
    try { if (customMap["photoDecorationCategories"]) photoDecorationCategories = JSON.parse(customMap["photoDecorationCategories"]); } catch {}
    try { if (customMap["timelines"]) timelines = JSON.parse(customMap["timelines"]); } catch {}
    try { if (customMap["foodItems"]) foodItems = JSON.parse(customMap["foodItems"]); } catch {}
    try { if (customMap["familyMembers"]) familyMembers = JSON.parse(customMap["familyMembers"]); } catch {}
    try { if (customMap["playlist"]) playlist = JSON.parse(customMap["playlist"]); } catch {}

    return NextResponse.json({
      success: true,
      isLocked,
      publishDate: scheduledDateStr || null,
      event: {
        id: event.id,
        title: event.title,
        subtitle: customMap["subtitle"] || "Forever Begins Today",
        location: event.location || customMap["venueName"] || "Grand Celebration Venue",
        heroTag: customMap["heroTag"] || (event.isLive ? "LIVE EVENT" : "CELEBRATION"),
        highlightType: customMap["highlightType"] || "video",
        highlightVideoUrl: customMap["highlightVideoUrl"] || "",
        highlightPhotos,
        videoCategories,
        videoDecorationCategories,
        showVideoDecoration: customMap["showVideoDecoration"] !== "false",
        photoCategories,
        photoDecorationCategories,
        showPhotoDecoration: customMap["showPhotoDecoration"] !== "false",
        showTimeline: customMap["showTimeline"] !== "false",
        timelines: timelines.length > 0 ? timelines : (event.timelines || []),
        showFoodMenu: customMap["showFoodMenu"] !== "false",
        foodItems,
        showFamily: customMap["showFamily"] !== "false",
        familyMembers,
        showPlaylist: customMap["showPlaylist"] !== "false",
        playlist,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}