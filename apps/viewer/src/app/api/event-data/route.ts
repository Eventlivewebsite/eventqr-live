import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || searchParams.get("event");

    if (!slug) {
      return NextResponse.json({ success: false, error: "Event slug required" }, { status: 400 });
    }

    const prisma = getPrisma();

    const event = await prisma.event.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug }
        ]
      },
      include: {
        settings: true,
        customFields: true,
        timelines: { orderBy: { sortOrder: "asc" } },
        albums: {
          include: {
            media: {
              where: { isApproved: true },
              orderBy: { createdAt: "desc" }
            }
          },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    if (Array.isArray(event.customFields)) {
      event.customFields.forEach((cf: any) => {
        try {
          customMap[cf.fieldName] = JSON.parse(cf.fieldValue);
        } catch {
          customMap[cf.fieldName] = cf.fieldValue;
        }
      });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        eventType: event.eventType,
        isLive: event.isLive,
        location: event.location,
        eventDate: event.eventDate,
        customFields: customMap,
        timelines: event.timelines,
        albums: event.albums,
        settings: event.settings
      }
    });
  } catch (error: any) {
    console.error("Failed to fetch viewer event data:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
