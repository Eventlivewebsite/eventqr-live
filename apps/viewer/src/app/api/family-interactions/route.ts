import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

// 1. GET Real Likes & Wishes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get("slug") || "";

    const prisma = getPrisma();
    const event = await prisma.event.findFirst({
      where: { OR: [{ slug: eventSlug }, { id: eventSlug }], isDeleted: false },
      include: { customFields: true }
    });

    if (!event) {
      return NextResponse.json({ success: false, likes: {}, comments: {} });
    }

    const likesField = event.customFields.find(f => f.fieldName === "family_likes_data");
    const commentsField = event.customFields.find(f => f.fieldName === "family_comments_data");

    let likes = {};
    let comments = {};

    try { if (likesField?.fieldValue) likes = JSON.parse(likesField.fieldValue); } catch {}
    try { if (commentsField?.fieldValue) comments = JSON.parse(commentsField.fieldValue); } catch {}

    return NextResponse.json({ success: true, likes, comments });
  } catch (err: any) {
    return NextResponse.json({ success: false, likes: {}, comments: {} });
  }
}

// 2. POST Save Real Like or Comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { slug, memberId, type, guestName, text } = body;

    if (!slug || memberId === undefined) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    const prisma = getPrisma();
    const event = await prisma.event.findFirst({
      where: { OR: [{ slug }, { id: slug }], isDeleted: false },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    if (type === "like") {
      const field = await prisma.eventCustomField.findFirst({
        where: { eventId: event.id, fieldName: "family_likes_data" }
      });
      let map: Record<string, number> = {};
      try { if (field?.fieldValue) map = JSON.parse(field.fieldValue); } catch {}
      map[memberId] = (map[memberId] || 0) + 1;

      await prisma.eventCustomField.upsert({
        where: { eventId_fieldName: { eventId: event.id, fieldName: "family_likes_data" } },
        update: { fieldValue: JSON.stringify(map) },
        create: { eventId: event.id, fieldName: "family_likes_data", fieldValue: JSON.stringify(map) }
      });

      return NextResponse.json({ success: true, currentLikes: map[memberId] });
    }

    if (type === "comment") {
      const field = await prisma.eventCustomField.findFirst({
        where: { eventId: event.id, fieldName: "family_comments_data" }
      });
      let map: Record<string, any[]> = {};
      try { if (field?.fieldValue) map = JSON.parse(field.fieldValue); } catch {}
      if (!map[memberId]) map[memberId] = [];

      const newComment = {
        name: guestName?.trim() || "Guest",
        text: text?.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      map[memberId].push(newComment);

      await prisma.eventCustomField.upsert({
        where: { eventId_fieldName: { eventId: event.id, fieldName: "family_comments_data" } },
        update: { fieldValue: JSON.stringify(map) },
        create: { eventId: event.id, fieldName: "family_comments_data", fieldValue: JSON.stringify(map) }
      });

      return NextResponse.json({ success: true, comments: map[memberId] });
    }

    return NextResponse.json({ success: false });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message }, { status: 500 });
  }
}