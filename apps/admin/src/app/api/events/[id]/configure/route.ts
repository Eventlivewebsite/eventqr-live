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

    let foodItems = [];
    let familyMembers = [];
    let videosList = [];
    let enabledModules = {
      invitation: true,
      family: true,
      guestbook: true,
      foodMenu: true,
    };

    try { if (customMap["foodItems"]) foodItems = JSON.parse(customMap["foodItems"]); } catch {}
    try { if (customMap["familyMembers"]) familyMembers = JSON.parse(customMap["familyMembers"]); } catch {}
    try { if (customMap["videosList"]) videosList = JSON.parse(customMap["videosList"]); } catch {}
    try { if (customMap["enabledModules"]) enabledModules = JSON.parse(customMap["enabledModules"]); } catch {}

    return NextResponse.json({
      success: true,
      event: {
        ...event,
        heroBannerUrl: customMap["heroBannerUrl"] || "",
        heroTag: customMap["heroTag"] || (event.isLive ? "LIVE EVENT" : "CELEBRATION"),
        venueName: event.location || customMap["venueName"] || "",
        highlightVideoUrl: customMap["highlightVideoUrl"] || "",
        trendingLoved: customMap["trendingLoved"] || "Highlights",
        trendingViewed: customMap["trendingViewed"] || "Special Moments",
        trendingDownloaded: customMap["trendingDownloaded"] || "Event Album",
        categoriesList: customMap["categoriesList"] ? JSON.parse(customMap["categoriesList"]) : ["Ceremony", "Haldi", "Reception", "Decoration"],
        foodItems,
        familyMembers,
        videosList,
        enabledModules,
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
      isLive,
      venueName,
      heroBannerUrl,
      heroTag,
      highlightVideoUrl,
      trendingLoved,
      trendingViewed,
      trendingDownloaded,
      categoriesList,
      timelines,
      foodItems,
      familyMembers,
      videosList,
      enabledModules,
    } = body;

    await prisma.event.update({
      where: { id },
      data: {
        ...(typeof isLive === "boolean" ? { isLive } : {}),
        ...(venueName ? { location: venueName } : {}),
      },
    });

    const fieldsToSave: Record<string, string> = {
      venueName: venueName || "",
      heroBannerUrl: heroBannerUrl || "",
      heroTag: heroTag || "LIVE EVENT",
      highlightVideoUrl: highlightVideoUrl || "",
      trendingLoved: trendingLoved || "Highlights",
      trendingViewed: trendingViewed || "Special Moments",
      trendingDownloaded: trendingDownloaded || "Event Album",
    };

    if (categoriesList) fieldsToSave["categoriesList"] = JSON.stringify(categoriesList);
    if (timelines) fieldsToSave["timelines"] = JSON.stringify(timelines);
    if (foodItems) fieldsToSave["foodItems"] = JSON.stringify(foodItems);
    if (familyMembers) fieldsToSave["familyMembers"] = JSON.stringify(familyMembers);
    if (videosList) fieldsToSave["videosList"] = JSON.stringify(videosList);
    if (enabledModules) fieldsToSave["enabledModules"] = JSON.stringify(enabledModules);

    for (const [fieldName, fieldValue] of Object.entries(fieldsToSave)) {
      if (fieldValue !== undefined) {
        await prisma.eventCustomField.upsert({
          where: {
            eventId_fieldName: { eventId: id, fieldName },
          },
          update: { fieldValue: String(fieldValue) },
          create: { eventId: id, fieldName, fieldValue: String(fieldValue) },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}