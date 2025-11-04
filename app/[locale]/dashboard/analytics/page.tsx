import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { BookingStatus } from "@prisma/client";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getAnalyticsData(
  organizationId: string
) {

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const baseWhere = {
    organizationId,
    status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
  };

  const [
    totalBookings,
    totalRevenue,
    bookingsByStatus,
    bookingsByProperty,
    dailyBookings,
  ] = await Promise.all([
    prisma.booking.count({ where: baseWhere }),
    prisma.booking.aggregate({
      where: baseWhere,
      _sum: { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    }),
    prisma.booking.groupBy({
      by: ["propertyId"],
      where: baseWhere,
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ["date"],
      where: {
        ...baseWhere,
        date: { gte: monthStart, lte: monthEnd },
      },
      _count: true,
      _sum: { totalAmount: true },
    }),
  ]);

  // Get property names
  const propertyIds = bookingsByProperty.map((b) => b.propertyId);
  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: { id: true, name: true },
  });

  const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p.name]));

  return {
    totalBookings,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    averageBookingValue:
      totalBookings > 0
        ? Number(totalRevenue._sum.totalAmount || 0) / totalBookings
        : 0,
    bookingsByStatus,
    bookingsByProperty: bookingsByProperty.map((b) => ({
      ...b,
      propertyName: propertyMap[b.propertyId] || "Unknown",
    })),
    dailyBookings,
  };
}

export default async function AnalyticsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations({ locale });

  if (!session?.user?.organizationId) {
    return <div>Unauthorized</div>;
  }

  const data = await getAnalyticsData(session.user.organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
        <p className="text-muted-foreground">{t("analytics.overview")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("analytics.totalBookings")}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalRevenue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(data.totalRevenue), "SAR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t("analytics.averageBookingValue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.averageBookingValue, "SAR")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.byStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.bookingsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <span>{t(`status.${item.status}`)}</span>
                  <span className="font-bold">{item._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.topProperties")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.bookingsByProperty.slice(0, 5).map((item) => (
                <div key={item.propertyId} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.propertyName}</span>
                    <span className="text-sm text-muted-foreground">
                      {item._count} bookings
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {formatCurrency(Number(item._sum.totalAmount || 0), "SAR")}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
