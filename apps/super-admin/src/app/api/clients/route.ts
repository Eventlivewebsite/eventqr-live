import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

// Prisma query ke exact return type ko infer karne ke liye
type ClientWithEvents = Prisma.ClientGetPayload<{
  include: { events: true };
}>;

export async function GET() {
  try {
    const clients: ClientWithEvents[] = await prisma.client.findMany({
      include: {
        events: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = clients.map((c) => ({
      id: c.id,
      companyName: c.companyName || "Unnamed Studio",
      contactPerson: c.contactPerson || "-",
      email: c.email || "-",
      phone: c.phone || "",
      storageLimitGB: c.storageLimitGB || 50,
      storageUsedGB: c.storageUsedGB || 0,
      totalEvents: Array.isArray(c.events) ? c.events.length : 0,
      activeEvents: Array.isArray(c.events)
        ? c.events.filter((e) => Boolean(e.isLive) || e.status === "APPROVED").length
        : 0,
      isActive: c.isActive ?? true,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, clients: formatted }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to load clients";
    console.error("GET CLIENTS DB ERROR:", error);
    return NextResponse.json({ success: false, error: msg, clients: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const { companyName, contactPerson, email, phone, storageLimitGB } = body;

    if (!companyName || !email) {
      return NextResponse.json(
        { success: false, error: "Studio Name and Email are required" },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const studioName = String(companyName).trim();
    const contact = String(contactPerson || companyName).trim();
    const phoneNum = String(phone || "").trim();
    const storageGB = Number(storageLimitGB) || 50;

    const newClient = await prisma.client.create({
      data: {
        companyName: studioName,
        contactPerson: contact,
        email: cleanEmail,
        phone: phoneNum,
        storageLimitGB: storageGB,
        storageUsedGB: 0,
        isActive: true,
        admin: {
          create: {
            email: cleanEmail,
            name: contact,
            passwordHash: "studio123",
            role: "ADMIN",
            isActive: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create client";
    console.error("CREATE CLIENT DB ERROR:", error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}