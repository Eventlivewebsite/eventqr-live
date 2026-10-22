import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL,
  max: 10,
  idleTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event") || "";

    if (!slug) {
      return NextResponse.json({ error: "Missing event slug" }, { status: 400 });
    }

    // Single lightning-fast indexed query fetching all modules
    const event = await prisma.event.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        clientName: true,
        type: true,
        eventDate: true,
        location: true,
        coverImage: true,
        logo: true,
        themeColor: true,
        status: true,
        guestBook: true,
        settings: true,
        customFields: true,
        timelines: {
          orderBy: { time: "asc" },
          select: {
            id: true,
            title: true,
            time: true,
            description: true,
            location: true,
            icon: true,
            isCompleted: true
          }
        },
        albums: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            type: true,
            coverUrl: true,
            _count: { select: { media: true } },
            media: {
              where: { isDeleted: false },
              select: {
                id: true,
                url: true,
                thumbnailUrl: true,
                type: true,
                title: true,
                createdAt: true
              },
              take: 50
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Map customFields into clean key-value pairs (Family, Food, Subtitle, Music, Venue)
    const fieldsMap: Record<string, any> = {};
    if (Array.isArray(event.customFields)) {
      event.customFields.forEach((cf: any) => {
        const k = cf.fieldName || cf.key || cf.name;
        if (k) {
          fieldsMap[k] = cf.fieldValue ?? cf.value ?? "";
        }
      });
    }

    const settingsObj = (typeof event.settings === "object" && event.settings !== null) 
      ? (event.settings as Record<string, any>) 
      : {};

    // Dynamic title & name resolver
    let groom = fieldsMap.groomName || settingsObj.groomName || "";
    let bride = fieldsMap.brideName || settingsObj.brideName || "";
    
    if (!groom && event.title && event.title.includes("&")) {
      const parts = event.title.split("&").map((s: string) => s.trim());
      groom = parts[0] || "";
      bride = parts[1] || "";
    } else if (!groom) {
      groom = event.title || event.clientName || "";
    }

    const subtitle = fieldsMap.subtitle || settingsObj.subtitle || "";
    const musicUrl = fieldsMap.musicUrl || settingsObj.musicUrl || "";
    const location = event.location || fieldsMap.venueName || fieldsMap.location || "";

    const payload = {
      ...event,
      title: event.title || groom,
      groomName: groom,
      brideName: bride,
      subtitle: subtitle,
      musicUrl: musicUrl,
      location: location,
      customFieldsMap: fieldsMap
    };

    return NextResponse.json({ event: payload }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
