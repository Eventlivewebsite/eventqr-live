import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const cleanSlug = String(slug || "").trim();

    if (!cleanSlug) {
      return NextResponse.json({ success: false, error: "Identifier required" }, { status: 400 });
    }

    const event: any = await prisma.event.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { id: cleanSlug },
        ],
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
    try {
      if (customMap["foodItems"]) {
        foodItems = JSON.parse(customMap["foodItems"]);
      }
    } catch {}

    let familyMembers = [];
    try {
      if (customMap["familyMembers"]) {
        familyMembers = JSON.parse(customMap["familyMembers"]);
      }
    } catch {}

    const response = NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        type: event.type,
        eventDate: event.eventDate,
        isLive: event.isLive,
        foodItems,
        familyMembers,
        settings: event.settings,
        albums: event.albums,
        timelines: event.timelines,
      },
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  return response;
}