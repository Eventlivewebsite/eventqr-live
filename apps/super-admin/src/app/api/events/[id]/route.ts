import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/super-admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// =======================
// UPDATE EVENT
// =======================

export async function PUT(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth.response) return auth.response;

    const { id } = await params;

    const body = await req.json();

    const {
      title,
      brideName,
      groomName,
      clientName,
      slug,
      type,
      eventDate,
      location,
      coverImage,
      logo,
      themeColor,
      qrEnabled,
      guestBook,
      isLive,
      status,
    } = body;

    const event = await prisma.event.update({
      where: {
        id,
      },
      data: {
        title,
        brideName,
        groomName,
        clientName,
        slug,
        type,
        eventDate: eventDate ? new Date(eventDate) : null,
        location,
        coverImage,
        logo,
        themeColor,
        qrEnabled,
        guestBook,
        isLive,
        status,
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        clientId: event.clientId,
        adminId: event.adminId,
        title: event.title,
        slug: event.slug,
        type: event.type,
        status: event.status,
        eventDate: event.eventDate,
        location: event.location,
        coverImage: event.coverImage,
        logo: event.logo,
        themeColor: event.themeColor,
        qrEnabled: event.qrEnabled,
        guestBook: event.guestBook,
        isLive: event.isLive,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Update failed.",
      },
      {
        status: 500,
      }
    );
  }
}

// =======================
// DELETE EVENT
// =======================

export async function DELETE(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const auth = await requireSuperAdmin(req);
    if (auth.response) return auth.response;

    const { id } = await params;

    await prisma.event.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}