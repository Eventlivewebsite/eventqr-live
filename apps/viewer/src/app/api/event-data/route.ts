import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSlug = searchParams.get("slug") || searchParams.get("event") || "";
    const slug = rawSlug.trim().replace(/[^a-zA-Z0-9-_]/g, "");

    const prisma = getPrisma();
    let event = null;

    if (slug) {
      event = await prisma.event.findFirst({
        where: { OR: [{ slug }, { id: slug }], isDeleted: false },
        include: {
          settings: true,
          timelines: true,
          customFields: true,
        },
      });
    }

    if (!event) {
      event = await prisma.event.findFirst({
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        include: {
          settings: true,
          timelines: true,
          customFields: true,
        },
      });
    }

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const customMap: Record<string, any> = {};
    for (const cf of event.customFields || []) {
      let val: any = cf.fieldValue;
      if (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      customMap[cf.fieldName] = val;
    }

    let foodItems = customMap["foodItems"] || [];
    if (typeof foodItems === "string") {
      try {
        foodItems = JSON.parse(foodItems);
      } catch {
        foodItems = [];
      }
    }

    // Unified Categories extraction from custom fields
    let categoriesList: string[] = [];
    const possibleCategoryKeys = [
      "photoCategories",
      "categories",
      "activeCategories",
      "unifiedCategories",
      "categoriesList",
      "eventCategories"
    ];

    for (const key of possibleCategoryKeys) {
      const candidate = customMap[key];
      if (Array.isArray(candidate) && candidate.length > 0) {
        categoriesList = candidate.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
        break;
      } else if (typeof candidate === "string" && candidate.trim()) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0) {
            categoriesList = parsed.map(c => typeof c === "string" ? c : c?.name || "").filter(Boolean);
            break;
          }
        } catch {
          categoriesList = candidate.split(",").map(c => c.trim()).filter(Boolean);
          if (categoriesList.length > 0) break;
        }
      }
    }

    const res = NextResponse.json({
      success: true,
      event: {
        id: event.id,
        slug: event.slug,
        title: event.title,
        subtitle: event.settings?.subtitle || customMap["subtitle"] || "",
        location: event.location || customMap["venueName"] || "",
        eventDate: event.eventDate,
        foodItems: Array.isArray(foodItems) ? foodItems : [],
        timelines: customMap["timelines"] || event.timelines || [],
        photoCategories: categoriesList,
        categoriesList,
        customMap,
      },
    });

    res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
    return res;
  } catch (err: any) {
    console.error("EVENT_DATA_API_ERROR:", err);
    return NextResponse.json({ success: false, message: err?.message || "Internal Error" }, { status: 500 });
  }
}