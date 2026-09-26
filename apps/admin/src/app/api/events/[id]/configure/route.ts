import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        settings: true,
        customFields: true,
        timelines: { orderBy: { sortOrder: "asc" } },
        albums: { orderBy: { sortOrder: "asc" } },
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

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        venueName: event.location || customMap["venueName"] || "",
        heroTag: customMap["heroTag"] || (event.isLive ? "LIVE EVENT" : "CELEBRATION"),
        highlightVideoUrl: customMap["highlightVideoUrl"] || "",
        customMap,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const {
      venueName,
      heroTag,
      highlightVideoUrl,
      subtitle,
      scheduledPublishDate,
      highlightType,
      highlightPhotos,
      videoCategories,
      videoDecorationCategories,
      showVideoDecoration,
      photoCategories,
      photoDecorationCategories,
      showPhotoDecoration,
      showTimeline,
      timelines,
      showFoodMenu,
      foodItems,
      showFamily,
      familyMembers,
      showPlaylist,
      playlist,
    } = body;

    if (venueName) {
      await prisma.event.update({
        where: { id },
        data: { location: venueName },
      });
    }

    const fieldsToSave: Record<string, any> = {
      venueName: venueName || "",
      heroTag: heroTag || "LIVE EVENT",
      highlightVideoUrl: highlightVideoUrl || "",
      subtitle: subtitle || "Forever Begins Today",
      scheduledPublishDate: scheduledPublishDate || "",
      highlightType: highlightType || "video",
      highlightPhotos: JSON.stringify(highlightPhotos || []),
      videoCategories: JSON.stringify(videoCategories || []),
      videoDecorationCategories: JSON.stringify(videoDecorationCategories || []),
      showVideoDecoration: String(showVideoDecoration ?? true),
      photoCategories: JSON.stringify(photoCategories || []),
      photoDecorationCategories: JSON.stringify(photoDecorationCategories || []),
      showPhotoDecoration: String(showPhotoDecoration ?? true),
      showTimeline: String(showTimeline ?? true),
      timelines: JSON.stringify(timelines || []),
      showFoodMenu: String(showFoodMenu ?? true),
      foodItems: JSON.stringify(foodItems || []),
      showFamily: String(showFamily ?? true),
      familyMembers: JSON.stringify(familyMembers || []),
      showPlaylist: String(showPlaylist ?? true),
      playlist: JSON.stringify(playlist || []),
    };

    for (const [fieldName, fieldValue] of Object.entries(fieldsToSave)) {
      await prisma.customField.upsert({
        where: {
          eventId_fieldName: { eventId: id, fieldName },
        },
        update: { fieldValue: String(fieldValue) },
        create: { eventId: id, fieldName, fieldValue: String(fieldValue) },
      });
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}