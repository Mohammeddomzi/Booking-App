import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { availabilitySchema } from "@/lib/validations";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!propertyId || !from || !to) {
      return NextResponse.json(
        { error: "propertyId, from, and to are required" },
        { status: 400 }
      );
    }

    const availability = await prisma.availability.findMany({
      where: {
        organizationId: session.user.organizationId,
        propertyId,
        date: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(availability);
  } catch (error: any) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (OWNER or MANAGER only)
    if (session.user.role === "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = availabilitySchema.parse(body);

    const date =
      typeof validatedData.date === "string"
        ? new Date(validatedData.date)
        : validatedData.date;

    const availability = await prisma.availability.upsert({
      where: {
        propertyId_date: {
          propertyId: validatedData.propertyId,
          date,
        },
      },
      update: {
        isOpen: validatedData.isOpen,
        openTime: validatedData.openTime,
        closeTime: validatedData.closeTime,
        slotDuration: validatedData.slotDuration,
      },
      create: {
        date,
        isOpen: validatedData.isOpen,
        openTime: validatedData.openTime,
        closeTime: validatedData.closeTime,
        slotDuration: validatedData.slotDuration,
        propertyId: validatedData.propertyId,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error: any) {
    console.error("Set availability error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
