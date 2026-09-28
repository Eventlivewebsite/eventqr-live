import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const cleanId = String(id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawAction = String(body.action || "").trim().toUpperCase();

    // Explicit check for reject vs accept/approve
    const isReject = rawAction === "REJECT" || rawAction === "REJECTED";
    const targetStatus = isReject ? "REJECTED" : "APPROVED";
    const targetIsLive = !isReject;

    const updated = await (prisma.event as any).update({
      where: { id: cleanId },
      data: {
        status: targetStatus,
        isLive: targetIsLive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event successfully marked as ${targetStatus}`,
      event: {
        id: updated.id,
        status: updated.status,
        isLive: updated.isLive,
      },
    });
  } catch (error: any) {
    console.error("[APPROVE_EVENT_ACTION_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update event status" },
      { status: 500 }
    );
  }
}