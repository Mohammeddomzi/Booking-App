import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations";
import { checkTimeOverlap } from "@/lib/utils";
import { BookingStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
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

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error("Get booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = bookingSchema.partial().parse(body);

    // Check if booking exists and belongs to organization
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // If date, time, or property changed, check for conflicts
    if (
      validatedData.date ||
      validatedData.startTime ||
      validatedData.endTime ||
      validatedData.propertyId
    ) {
      const bookingDate =
        typeof validatedData.date === "string"
          ? new Date(validatedData.date)
          : validatedData.date || existingBooking.date;

      const startTime = validatedData.startTime || existingBooking.startTime;
      const endTime =
        validatedData.endTime || existingBooking.endTime || "23:59:59";

      const propertyId = validatedData.propertyId || existingBooking.propertyId;

      const conflictingBookings = await prisma.booking.findMany({
        where: {
          organizationId: session.user.organizationId,
          propertyId,
          date: bookingDate,
          id: { not: params.id },
          status: {
            notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
          },
        },
      });

      const hasConflict = conflictingBookings.some((booking) => {
        const existingEndTime = booking.endTime || "23:59:59";
        return checkTimeOverlap(
          startTime,
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
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(validatedData.date && {
          date:
            typeof validatedData.date === "string"
              ? new Date(validatedData.date)
              : validatedData.date,
        }),
        ...(validatedData.startTime && { startTime: validatedData.startTime }),
        ...(validatedData.endTime && { endTime: validatedData.endTime }),
        ...(validatedData.customerName && {
          customerName: validatedData.customerName,
        }),
        ...(validatedData.customerPhone && {
          customerPhone: validatedData.customerPhone,
        }),
        ...(validatedData.totalAmount !== undefined && {
          totalAmount: validatedData.totalAmount,
        }),
        ...(validatedData.deposit !== undefined && {
          deposit: validatedData.deposit,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
        ...(validatedData.receiptUrl !== undefined && {
          receiptUrl: validatedData.receiptUrl,
        }),
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.propertyId && {
          propertyId: validatedData.propertyId,
        }),
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

    // TODO: Send email notification for status changes
    // if (validatedData.status && validatedData.status !== existingBooking.status) {
    //   await sendBookingStatusChangeEmail(updatedBooking);
    // }

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete (OWNER or MANAGER only)
    if (session.user.role === "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if booking exists and belongs to organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: params.id,
        organizationId: session.user.organizationId,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    console.error("Delete booking error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
