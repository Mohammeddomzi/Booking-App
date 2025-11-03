import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: session.user.organizationId },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only OWNER can update organization
    if (session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = organizationSchema.parse(body);

    // Check if slug is already taken by another organization
    if (validatedData.slug) {
      const existingOrg = await prisma.organization.findUnique({
        where: { slug: validatedData.slug },
      });

      if (existingOrg && existingOrg.id !== session.user.organizationId) {
        return NextResponse.json(
          { error: "Slug is already taken" },
          { status: 400 }
        );
      }
    }

    const organization = await prisma.organization.update({
      where: { id: session.user.organizationId },
      data: validatedData,
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
