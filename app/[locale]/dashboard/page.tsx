import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, DollarSign, BarChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { BookingStatus } from "@prisma/client";

async function getDashboardData(organizationId: string) {
  const now = new Date();
  const today = { gte: startOfDay(now), lte: endOfDay(now) };
  const thisWeek = { gte: startOfWeek(now), lte: endOfWeek(now) };
  const thisMonth = { gte: startOfMonth(now), lte: endOfMonth(now) };

  const baseWhere = {
    organizationId,
    status: { notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW] },
  };

  const [
    todayBookings,
    weekBookings,
    monthBookings,
    todayRevenue,
    weekRevenue,
    monthRevenue,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({ where: { ...baseWhere, date: today } }),
    prisma.booking.count({ where: { ...baseWhere, date: thisWeek } }),
    prisma.booking.count({ where: { ...baseWhere, date: thisMonth } }),
    prisma.booking.aggregate({
      where: { ...baseWhere, date: today },
      _sum: { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { ...baseWhere, date: thisWeek },
      _sum: { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { ...baseWhere, date: thisMonth },
      _sum: { totalAmount: true },
    }),
    prisma.booking.findMany({
      where: { organizationId },
      include: { property: true, createdBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    todayBookings,
    weekBookings,
    monthBookings,
    todayRevenue: todayRevenue._sum.totalAmount || 0,
    weekRevenue: weekRevenue._sum.totalAmount || 0,
    monthRevenue: monthRevenue._sum.totalAmount || 0,
    recentBookings,
  };
}

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const session = await getServerSession(authOptions);
  const t = await getTranslations({ locale });

  if (!session?.user?.organizationId) {
    return <div>Unauthorized</div>;
  }

  const data = await getDashboardData(session.user.organizationId);

  const metrics = [
    {
      title: t("dashboard.todayBookings"),
      value: data.todayBookings,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      title: t("dashboard.weekBookings"),
      value: data.weekBookings,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: t("dashboard.todayRevenue"),
      value: formatCurrency(Number(data.todayRevenue), "SAR"),
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: t("dashboard.monthRevenue"),
      value: formatCurrency(Number(data.monthRevenue), "SAR"),
      icon: BarChart,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentBookings")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {t("bookings.noBookings")}
            </p>
          ) : (
            <div className="space-y-4">
              {data.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.property.name} •{" "}
                      {booking.date.toLocaleDateString(locale)}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-medium">
                      {formatCurrency(Number(booking.totalAmount), "SAR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`status.${booking.status}`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
