import { NextResponse } from "next/server";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.DIRECT_URL ||
      "";

    if (!dbUrl) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }

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

    // Fallback to latest active event if slug is missing

    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        location: true,
        eventDate: true,
        photoCategories: true,
        videoCategories: true,
        timelines: {
          select: {
            id: true,
            title: true,
            time: true,
            description: true,
            status: true,
          },
          orderBy: { time: "asc" },
        },
        photos: {
          where: { isApproved: true },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            caption: true,
            category: true,
            likesCount: true,
            viewsCount: true,
            downloadsCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        videos: {
          where: { isApproved: true },
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            title: true,
            category: true,
            likesCount: true,
            viewsCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        guestWishes: {
          where: { isApproved: true },
          select: {
            id: true,
            guestName: true,
            message: true,
            likesCount: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        customFields: {
          select: {
            fieldName: true,
            fieldValue: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      try {
        customMap[cf.fieldName] = JSON.parse(cf.fieldValue);
      } catch {
        customMap[cf.fieldName] = cf.fieldValue;
      }
    }

    const safeParseArray = (val: any) => {
      let curr = val || [];
      while (typeof curr === "string") {
        try {
          curr = JSON.parse(curr);
        } catch {
          break;
        }
      }
      return Array.isArray(curr) ? curr : [];
    };

    const foodItems = safeParseArray(customMap["foodItems"]);
    const familyMembers = safeParseArray(customMap["familyMembers"]);
    const decorationZones = safeParseArray(customMap["decorationZones"]);
    const highlightPhotos = safeParseArray(customMap["highlightPhotos"]);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.subtitle || customMap["subtitle"] || "",
        location: event.location || customMap["venueName"] || "",
        eventDate: event.eventDate,
        photoCategories: event.photoCategories || [],
        videoCategories: event.videoCategories || [],
        foodItems,
        familyMembers,
        decorationZones,
        highlightPhotos,
        timelines: event.timelines || [],
        photos: event.photos || [],
        videos: event.videos || [],
        guestWishes: event.guestWishes || [],
        customMap,
      },
    });
  } catch (error: any) {
    console.error("Secure Event-Data API Error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, name, message } = body;

    const cleanSlug = (slug || "").trim().replace(/[^a-zA-Z0-9-_]/g, "");
    const cleanName = (name || "").trim().slice(0, 100);
    const cleanMessage = (message || "").trim().slice(0, 500);

    if (!cleanSlug || !cleanName || !cleanMessage) {
      return NextResponse.json(
        { success: false, message: "Name, message and valid slug are required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const event = await prisma.event.findFirst({
      where: { OR: [{ slug: cleanSlug }, { id: cleanSlug }] },
      select: { id: true }
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const createdWish = await prisma.guestWish.create({
      data: {
        eventId: event.id,
        guestName: cleanName,
        message: cleanMessage,
        isApproved: true,
        likesCount: 1,
      }
    });

    return NextResponse.json({ success: true, wish: createdWish });
  } catch (error: any) {
    console.error("Wish POST Error:", error?.message || error);
    return NextResponse.json({ success: false, message: "Failed to post blessing" }, { status: 500 });
  }
}