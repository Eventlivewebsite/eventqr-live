import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is missing.");
  }
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? getPrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event") || "testing-nns3";

    const event: any = await prisma.event.findFirst({
      where: {
        OR: [{ slug: String(slug) }, { id: String(slug) }],
        isDeleted: false,
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

    let foodItems = [];
    let familyMembers = [];
    let categoriesList = [];
    let videosList = [];
    let enabledModules = {
      invitation: true,
      family: true,
      guestbook: true,
      foodMenu: true,
    };

    try { if (customMap["foodItems"]) foodItems = JSON.parse(customMap["foodItems"]); } catch {}
    try { if (customMap["familyMembers"]) familyMembers = JSON.parse(customMap["familyMembers"]); } catch {}
    try { if (customMap["categoriesList"]) categoriesList = JSON.parse(customMap["categoriesList"]); } catch {}
    try { if (customMap["videosList"]) videosList = JSON.parse(customMap["videosList"]); } catch {}
    try { if (customMap["enabledModules"]) enabledModules = JSON.parse(customMap["enabledModules"]); } catch {}

    let timelineList = event.timelines || [];
    if (timelineList.length === 0 && customMap["timelines"]) {
      try { timelineList = JSON.parse(customMap["timelines"]); } catch {}
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        type: event.type,
        slug: event.slug,
        location: event.location || customMap["venueName"] || "Grand Celebration Venue",
        heroTag: customMap["heroTag"] || (event.isLive ? "LIVE EVENT" : "CELEBRATION"),
        heroBannerUrl: customMap["heroBannerUrl"] || "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
        highlightVideoUrl: customMap["highlightVideoUrl"] || "",
        trendingLoved: customMap["trendingLoved"] || "Highlights",
        trendingViewed: customMap["trendingViewed"] || "Special Moments",
        trendingDownloaded: customMap["trendingDownloaded"] || "Event Album",
        categoriesList: categoriesList.length > 0 ? categoriesList : ["Ceremony", "Haldi", "Mehendi", "Reception", "Family", "Party", "Decoration"],
        timelines: timelineList,
        albums: event.albums || [],
        foodItems,
        familyMembers,
        videosList,
        enabledModules,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}