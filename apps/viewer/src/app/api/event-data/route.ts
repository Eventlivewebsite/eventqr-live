import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get("slug") || searchParams.get("event") || "";
    const slug = rawSlug.trim().replace(/[^a-zA-Z0-9-_]/g, "");

    let event = null;
    if (slug) {
      event = await prisma.event.findFirst({
        where: { OR: [{ slug }, { id: slug }], isDeleted: false },
        include: {
          settings: true,
          timelines: true,
          photos: { where: { isApproved: true } },
          videos: { where: { isApproved: true } },
          guestWishes: { where: { isApproved: true } },
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
          timelines: true,
          photos: { where: { isApproved: true } },
          videos: { where: { isApproved: true } },
          guestWishes: { where: { isApproved: true } },
          customFields: true,
        },
      });
    }

    if (!event) {
      return NextResponse.json({ success: false, message: "No event found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      let val: any = cf.fieldValue;
      while (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {
          break;
        }
      }
      customMap[cf.fieldName] = val;
    }

    const foodItems = Array.isArray(customMap["foodItems"]) ? customMap["foodItems"] : [];
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
        foodItems,
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
