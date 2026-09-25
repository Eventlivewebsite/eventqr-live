import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event");

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    const prisma = getPrisma();

    const event: any = await prisma.event.findFirst({
      where: { slug, isDeleted: false },
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

    let familyMembers = [];
    let foodItems = [];
    try {
      if (customMap["familyMembers"]) familyMembers = JSON.parse(customMap["familyMembers"]);
      if (customMap["foodItems"]) foodItems = JSON.parse(customMap["foodItems"]);
    } catch {
      // fallback
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.settings?.subtitle || "Forever Begins Today",
        venueName: event.location || "",
        eventDate: event.eventDate ? event.eventDate.toISOString() : new Date().toISOString(),
        accessMode: event.accessMode || "PUBLIC",
        pinCode: event.pinCode || "",
        heroTag: customMap["heroTag"] || "LIVE CELEBRATION",
        familyMembers,
        foodItems,
        timeline: Array.isArray(event.timelines)
          ? event.timelines.map((t: any) => ({
              title: t.title,
              time: t.timeText || "TBD",
              status: t.statusText || "UPCOMING",
            }))
          : [],
      },
    });
  } catch (error: any) {
    console.error("Viewer API error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}