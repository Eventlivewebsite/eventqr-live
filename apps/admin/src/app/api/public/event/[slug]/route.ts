import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug required" }, { status: 400 });
    }

    const event: any = await prisma.event.findFirst({
      where: { slug: String(slug), isDeleted: false },
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
      // safe fallback
    }

    const response = NextResponse.json({
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

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    return response;
  } catch (error: any) {
    console.error("Public API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
