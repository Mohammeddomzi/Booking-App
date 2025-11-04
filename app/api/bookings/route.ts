import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { checkTimeOverlap } from "@/lib/utils";
import { BookingStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status && status !== "ALL") {
      where.status = status as BookingStatus;
    }

    if (from && to) {
      where.date = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("Get bookings error:", error);
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

    const body = await req.json();
    const validatedData = bookingSchema.parse(body);

    // Convert date to Date object if it's a string
    const bookingDate =
      typeof validatedData.date === "string"
        ? new Date(validatedData.date)
        : validatedData.date;

    // Calculate end time if not provided (default 1 hour)
    let endTime = validatedData.endTime;
    if (!endTime) {
      const property = await prisma.property.findUnique({
        where: { id: validatedData.propertyId },
      });
      const slotDuration = property?.slotDuration || 60;
      const [hours, minutes] = validatedData.startTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + slotDuration;
      const endHours = Math.floor(totalMinutes / 60);
      const endMinutes = totalMinutes % 60;
      endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
        .toString()
        .padStart(2, "0")}:00`;
    }

    // Check for conflicts
    const existingBookings = await prisma.booking.findMany({
      where: {
        organizationId: session.user.organizationId,
        propertyId: validatedData.propertyId,
        date: bookingDate,
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
      },
    });

    const hasConflict = existingBookings.some((booking) => {
      const existingEndTime = booking.endTime || "23:59:59";
      return checkTimeOverlap(
        validatedData.startTime,
        endTime,
        booking.startTime,
        existingEndTime
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "Time slot conflict with existing booking" },
        { status: 409 }
      );
    }

    // Determine initial status based on deposit
    let status = validatedData.status;
    if (status === BookingStatus.PENDING && validatedData.deposit > 0) {
      status = BookingStatus.CONFIRMED;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        startTime: validatedData.startTime,
        endTime,
        customerName: validatedData.customerName,
        customerPhone: validatedData.customerPhone,
        totalAmount: validatedData.totalAmount,
        deposit: validatedData.deposit,
        notes: validatedData.notes,
        receiptUrl: validatedData.receiptUrl,
        status,
        propertyId: validatedData.propertyId,
        organizationId: session.user.organizationId,
        createdById: session.user.id,
      },
      include: {
        property: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email notification
    // await sendBookingConfirmationEmail(booking);

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
