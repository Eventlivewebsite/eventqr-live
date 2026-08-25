import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AlbumType, MediaType } from "@prisma/client";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: eventId } = await context.params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const albums = await prisma.album.findMany({
      where: {
        eventId: eventId,
        isHidden: false,
      },
      include: {
        media: {
          where: { isDeleted: false },
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    // Format media records for frontend display
    const mediaList = albums.flatMap((album) =>
      album.media.map((m) => ({
        id: m.id,
        url: m.originalPath,
        thumbnailUrl: m.thumbnailPath || m.originalPath,
        fileName: m.fileName,
        type: m.mediaType,
        category: album.title,
        albumId: album.id,
        fileSize: Number(m.fileSize),
        createdAt: m.uploadedAt.toISOString(),
      }))
    );

    return NextResponse.json({ success: true, media: mediaList });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch media";
    console.error("GET MEDIA ERROR:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: eventId } = await context.params;
    const body = await req.json();
    const { url, type, category, fileName, fileSize } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Media URL is required" },
        { status: 400 }
      );
    }

    const categoryTitle = (category || "Highlights").trim();
    const safeSlug = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Match enum type or fallback to CUSTOM
    const validAlbumType = Object.values(AlbumType).includes(categoryTitle.toUpperCase() as AlbumType)
      ? (categoryTitle.toUpperCase() as AlbumType)
      : AlbumType.CUSTOM;

    // 1. Find or create Album for this category under this event
    let album = await prisma.album.findFirst({
      where: {
        eventId: eventId,
        title: categoryTitle,
      },
    });

    if (!album) {
      album = await prisma.album.create({
        data: {
          eventId: eventId,
          title: categoryTitle,
          slug: `${safeSlug}-${Date.now()}`,
          type: validAlbumType,
        },
      });
    }

    // 2. Determine file metadata
    const resolvedMediaType: MediaType = type === "VIDEO" ? MediaType.VIDEO : MediaType.PHOTO;
    const extractedFileName = fileName || url.split("/").pop() || "upload-media";
    const fileExtension = extractedFileName.includes(".")
      ? extractedFileName.split(".").pop() || "jpg"
      : "jpg";
    const mimeType = resolvedMediaType === MediaType.VIDEO ? "video/mp4" : "image/jpeg";

    // 3. Create Media linked to Album
    const newMedia = await prisma.media.create({
      data: {
        albumId: album.id,
        originalPath: url,
        fileName: extractedFileName,
        fileExtension: fileExtension,
        mimeType: mimeType,
        mediaType: resolvedMediaType,
        fileSize: BigInt(fileSize || 2048000),
      },
    });

    return NextResponse.json({
      success: true,
      media: {
        id: newMedia.id,
        url: newMedia.originalPath,
        type: newMedia.mediaType,
        category: album.title,
        fileName: newMedia.fileName,
        createdAt: newMedia.uploadedAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to save media";
    console.error("UPLOAD MEDIA ERROR:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}