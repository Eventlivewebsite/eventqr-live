import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Automated Lifecycle Processor (Triggered by Cron or Admin Panel)
export async function GET(req: NextRequest) {
  try {
    const now = new Date();

    const allEvents = await (prisma.event as any).findMany({
      where: { isDeleted: false },
      include: { customFields: true }
    });

    let recycledCount = 0;
    let purgedCount = 0;

    for (const ev of allEvents) {
      const eventDate = ev.eventDate ? new Date(ev.eventDate) : new Date(ev.createdAt);
      const diffDays = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

      // Rule: Day 6 to 10 (Recycle Bin - Warning State)
      if (diffDays >= 6 && diffDays <= 10 && !ev.isDeleted) {
        await (prisma.event as any).update({
          where: { id: ev.id },
          data: {
            isDeleted: true,
            deletedAt: now,
            isLive: false,
          }
        });
        recycledCount++;
      }

      // Rule: Day 11+ (Auto-Purge permanent cleanup)
      if (diffDays > 10) {
        await (prisma.event as any).delete({
          where: { id: ev.id }
        }).catch(() => null);
        purgedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Lifecycle evaluated: ${recycledCount} moved to Recycle Bin, ${purgedCount} permanently purged.`,
      recycledCount,
      purgedCount
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// Restore Event from Recycle Bin / Extend 48-hr Grace
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { eventId, action } = body;

    if (!eventId) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    if (action === "RESTORE") {
      const restored = await (prisma.event as any).update({
        where: { id: eventId },
        data: {
          isDeleted: false,
          deletedAt: null,
          isLive: true,
        }
      });
      return NextResponse.json({ success: true, message: "Event restored successfully!", event: restored });
    }

    if (action === "EXTEND_GRACE") {
      const extendedDate = new Date();
      extendedDate.setDate(extendedDate.getDate() + 2); // 48-hour extension

      const extended = await (prisma.event as any).update({
        where: { id: eventId },
        data: {
          isDeleted: false,
          expiryDate: extendedDate,
          isLive: true,
        }
      });
      return NextResponse.json({ success: true, message: "48-Hour Grace Period activated!", event: extended });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
