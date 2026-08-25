import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  try {
    const { id: eventId } = await context.params;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        albums: {
          where: {
            isHidden: false,
            ...(category && category !== "ALL" ? { title: category } : {}),
          },
          include: {
            media: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found in database" },
        { status: 404 }
      );
    }

    // Flatten all media across filtered albums
    const filesToExport = event.albums.flatMap((album) =>
      album.media.map((m) => ({
        id: m.id,
        fileName: m.fileName,
        url: m.originalPath,
        category: album.title,
        type: m.mediaType,
        fileSize: Number(m.fileSize),
      }))
    );

    return NextResponse.json({
      success: true,
      eventTitle: event.title,
      totalFiles: filesToExport.length,
      files: filesToExport,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to export ZIP manifest";
    console.error("ZIP EXPORT ERROR:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}