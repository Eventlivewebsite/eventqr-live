import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const dbUrl = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
    const pool = new Pool({
      connectionString: dbUrl,
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

    // Dhoondo slug se, ya agar slug empty hai toh database ka latest active event
    let event = null;
    if (slug) {
      event = await prisma.event.findFirst({
        where: { OR: [{ slug }, { id: slug }], isDeleted: false },
        include: {
          settings: true,
          timelines: { orderBy: { time: "asc" } },
          photos: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          videos: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          guestWishes: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          customFields: true,
        },
      });
    }

    if (!event) {
      event = await prisma.event.findFirst({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          settings: true,
          timelines: { orderBy: { time: "asc" } },
          photos: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          videos: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          guestWishes: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
          customFields: true,
        },
      });
    }

    if (!event) {
      return NextResponse.json({ success: false, message: "No event found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      try {
        customMap[cf.fieldName] = JSON.parse(cf.fieldValue);
      } catch {
        customMap[cf.fieldName] = cf.fieldValue;
      }
    }

    const safeParse = (val: any) => {
      let curr = val || [];
      while (typeof curr === "string") {
        try { curr = JSON.parse(curr); } catch { break; }
      }
      return Array.isArray(curr) ? curr : [];
    };

    const finalSubtitle = event.settings?.subtitle || customMap["subtitle"] || "";
    const finalLocation = event.location || customMap["venueName"] || customMap["venueLocation"] || "";

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: finalSubtitle,
        location: finalLocation,
        eventDate: event.eventDate,
        photoCategories: event.photoCategories || [],
        videoCategories: event.videoCategories || [],
        foodItems: safeParse(customMap["foodItems"]),
        familyMembers: safeParse(customMap["familyMembers"]),
        decorationZones: safeParse(customMap["decorationZones"]),
        highlightPhotos: safeParse(customMap["highlightPhotos"]),
        timelines: event.timelines || [],
        photos: event.photos || [],
        videos: event.videos || [],
        guestWishes: event.guestWishes || [],
        customMap,
      },
    });
  } catch (error: any) {
    console.error("FATAL_EVENT_DATA_API:", error);
    return NextResponse.json({ success: false, message: error?.message || "Internal error" }, { status: 500 });
  }
}
