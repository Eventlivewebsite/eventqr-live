
function safeMergeCustomMap(existingMap: any, incomingMap: any) {
  const existing = typeof existingMap === "object" && existingMap !== null ? existingMap : {};
  const incoming = typeof incomingMap === "object" && incomingMap !== null ? incomingMap : {};
  
  const categories = (incoming.categories && incoming.categories.length > 0)
    ? incoming.categories
    : (existing.categories || []);

  const decorItems = (incoming.decorItems && incoming.decorItems.length > 0)
    ? incoming.decorItems
    : (existing.decorItems || []);

  const existingVault = Array.isArray(existing.mediaVault) ? existing.mediaVault : [];
  const incomingVault = Array.isArray(incoming.mediaVault) ? incoming.mediaVault : [];
  
  // Deduplicate mediaVault items by url / id
  const vaultMap = new Map();
  for (const m of existingVault) {
    if (m && (m.url || m.id)) vaultMap.set(m.url || m.id, m);
  }
  for (const m of incomingVault) {
    if (m && (m.url || m.id)) vaultMap.set(m.url || m.id, m);
  }

  return {
    ...existing,
    ...incoming,
    categories,
    decorItems,
    mediaVault: Array.from(vaultMap.values())
  };
}

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
      customMap["mediaVault"] = customMap["mediaVault"] || "[]";
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
    const rawDecorItems = body?.decorationItems || body?.decorationAlbums || [];

    const { title, venueName, ceremonyName, ourStoryUrl, inviteBadge, inviteCoupleInitials, inviteTagline, inviteMessage, inviteDateText, inviteTimeText, inviteVenueText,
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

          const eventUpdateData: any = {};
      if (title !== undefined && title !== null) eventUpdateData.title = title;
      if (venueName !== undefined && venueName !== null) eventUpdateData.location = venueName;

      if (Object.keys(eventUpdateData).length > 0) {
        await prisma.event.update({
          where: { id },
          data: eventUpdateData,
        });
      }

    const fieldsToSave: Record<string, any> = {};

      if (venueName !== undefined) fieldsToSave.venueName = venueName || "";
      if (ceremonyName !== undefined) fieldsToSave.ceremonyName = ceremonyName || "";
      if (ourStoryUrl !== undefined) fieldsToSave.ourStoryUrl = ourStoryUrl || "";
      if (inviteBadge !== undefined) fieldsToSave.inviteBadge = inviteBadge || "";
      if (inviteCoupleInitials !== undefined) fieldsToSave.inviteCoupleInitials = inviteCoupleInitials || "";
      if (inviteTagline !== undefined) fieldsToSave.inviteTagline = inviteTagline || "";
      if (inviteMessage !== undefined) fieldsToSave.inviteMessage = inviteMessage || "";
      if (inviteDateText !== undefined) fieldsToSave.inviteDateText = inviteDateText || "";
      if (inviteTimeText !== undefined) fieldsToSave.inviteTimeText = inviteTimeText || "";
      if (inviteVenueText !== undefined) fieldsToSave.inviteVenueText = inviteVenueText || "";
      if (heroTag !== undefined) fieldsToSave.heroTag = heroTag || "LIVE EVENT";
      if (highlightVideoUrl !== undefined) fieldsToSave.highlightVideoUrl = highlightVideoUrl || "";
      if (subtitle !== undefined) fieldsToSave.subtitle = subtitle || "";
      if (scheduledPublishDate !== undefined) fieldsToSave.scheduledPublishDate = scheduledPublishDate || "";
      if (highlightType !== undefined) fieldsToSave.highlightType = highlightType || "video";
      if (highlightPhotos !== undefined) fieldsToSave.highlightPhotos = JSON.stringify(highlightPhotos);

      // Only update categories and decorations if explicitly provided
      if (videoCategories !== undefined) fieldsToSave.videoCategories = JSON.stringify(videoCategories);
      if (videoDecorationCategories !== undefined) fieldsToSave.videoDecorationCategories = JSON.stringify(videoDecorationCategories);
      if (showVideoDecoration !== undefined) fieldsToSave.showVideoDecoration = String(showVideoDecoration);

      if (photoCategories !== undefined) fieldsToSave.photoCategories = JSON.stringify(photoCategories);
      if (photoDecorationCategories !== undefined) fieldsToSave.photoDecorationCategories = JSON.stringify(photoDecorationCategories);

      if (rawDecorItems && (body.decorationItems !== undefined || body.decorationAlbums !== undefined)) {
        fieldsToSave.decorationItems = JSON.stringify(rawDecorItems);
      }

      if (body.showDecoration !== undefined) fieldsToSave.showDecoration = String(body.showDecoration);
      if (showPhotoDecoration !== undefined) fieldsToSave.showPhotoDecoration = String(showPhotoDecoration);

      if (timelines !== undefined) fieldsToSave.timelines = JSON.stringify(timelines);
      if (showTimeline !== undefined) fieldsToSave.showTimeline = String(showTimeline);

      if (foodItems !== undefined) fieldsToSave.foodItems = JSON.stringify(foodItems);
      if (showFoodMenu !== undefined) fieldsToSave.showFoodMenu = String(showFoodMenu);

      if (familyMembers !== undefined) fieldsToSave.familyMembers = JSON.stringify(familyMembers);
      if (showFamily !== undefined) fieldsToSave.showFamily = String(showFamily);

      if (playlist !== undefined) fieldsToSave.playlist = JSON.stringify(playlist);
      if (showPlaylist !== undefined) fieldsToSave.showPlaylist = String(showPlaylist);

      if (body.mediaVault !== undefined) {
        fieldsToSave.mediaVault = JSON.stringify(body.mediaVault);
      }
      
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