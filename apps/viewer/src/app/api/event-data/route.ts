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

function safeParse(val: any, fallback: any = []) {
  if (!val) return fallback;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event") || "";

    if (!slug) {
      return NextResponse.json({ success: false, error: "Missing event slug" }, { status: 400 });
    }

    const event = await prisma.event.findFirst({
      where: {
        slug: slug,
        isDeleted: false,
      },
      include: {
        customFields: true,
        settings: true,
        timelines: { orderBy: { time: "asc" } },
        albums: {
          where: { isDeleted: false },
          include: {
            media: {
              where: { isDeleted: false },
              take: 50,
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Extract Customizer fields
    const customMap: Record<string, any> = {};
    if (Array.isArray(event.customFields)) {
      event.customFields.forEach((cf: any) => {
        customMap[cf.fieldName] = cf.fieldValue;
      });
    }

    const settingsObj = (typeof event.settings === "object" && event.settings !== null) 
      ? (event.settings as Record<string, any>) 
      : {};

    const venueName = event.location || customMap["venueName"] || "";
    const subtitle = customMap["subtitle"] || settingsObj["subtitle"] || "";
    const heroTag = customMap["heroTag"] || (event.isLive ? "LIVE EVENT" : "CELEBRATION");
    const ceremonyName = customMap["ceremonyName"] || customMap["stageName"] || "Main Ceremony";
    const ourStoryUrl = customMap["ourStoryUrl"] || "";
    const highlightType = customMap["highlightType"] || (customMap["highlightVideoUrl"] ? "video" : "photos");
    const highlightVideoUrl = customMap["highlightVideoUrl"] || "";
    const highlightPhotos = safeParse(customMap["highlightPhotos"], []);

    // Timeline array resolver (checks JSON customField first, then DB relation)
    const rawTimelines = safeParse(customMap["timelines"], null);
    const timelines = Array.isArray(rawTimelines) && rawTimelines.length > 0 ? rawTimelines : (event.timelines || []);

    const payload = {
      ...event,
      title: event.title,
      subtitle: subtitle,
      location: venueName,
      venueName: venueName,
      heroTag: heroTag,
      ceremonyName: ceremonyName,
      ourStoryUrl: ourStoryUrl,
      highlightType: highlightType,
      highlightVideoUrl: highlightVideoUrl,
      highlightPhotos: highlightPhotos,
      timelines: timelines,
      foodItems: safeParse(customMap["foodItems"], []),
      familyMembers: safeParse(customMap["familyMembers"], []),
      playlist: safeParse(customMap["playlist"], []),
      photoCategories: safeParse(customMap["photoCategories"], []),
      videoCategories: safeParse(customMap["videoCategories"], []),
      showTimeline: customMap["showTimeline"] !== "false",
      showFoodMenu: customMap["showFoodMenu"] !== "false",
      showFamily: customMap["showFamily"] !== "false",
      showPlaylist: customMap["showPlaylist"] !== "false",
      customMap
    };

    return NextResponse.json({ success: true, event: payload }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
