import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action } = body; // "ACCEPT" | "REJECT"

    if (!id) {
      return NextResponse.json({ success: false, error: "Event ID is required" }, { status: 400 });
    }

    if (action === "ACCEPT") {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          status: "APPROVED",
          isLive: true,
        },
      });
      return NextResponse.json({ success: true, message: "Event approved successfully", event: updated });
    }

    if (action === "REJECT") {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          status: "REJECTED",
          isLive: false,
        },
      });
      return NextResponse.json({ success: true, message: "Event rejected", event: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action specified" }, { status: 400 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Database action failed";
    console.error("EVENT ACTION ERROR:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}