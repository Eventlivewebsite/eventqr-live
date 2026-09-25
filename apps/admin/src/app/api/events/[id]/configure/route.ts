import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    const event: any = await prisma.event.findFirst({
      where: {
        OR: [{ id: cleanId }, { slug: cleanId }],
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

    let familyMembers = [];
    let foodItems = [];
    try {
      if (customMap["familyMembers"]) familyMembers = JSON.parse(customMap["familyMembers"]);
      if (customMap["foodItems"]) foodItems = JSON.parse(customMap["foodItems"]);
    } catch {}

    const res = NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title || "Live Celebration",
        subtitle: event.settings?.subtitle || "Forever Begins Today",
        venueName: event.location || "Grand Palace",
        eventDate: event.eventDate ? event.eventDate.toISOString() : new Date().toISOString(),
        accessMode: "PUBLIC",
        heroTag: customMap["heroTag"] || "LIVE CELEBRATION",
        familyMembers,
        foodItems,
      },
    });

    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  return res;
}
