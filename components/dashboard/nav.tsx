"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Clock,
  BarChart3,
  Settings,
  ShieldCheck,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function DashboardNav({ locale }: { locale: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems: NavItem[] = [
    {
      title: t("dashboard"),
      href: `/en/dashboard`,
      icon: LayoutDashboard,
    },
    {
      title: t("bookings"),
      href: `/en/dashboard/bookings`,
      icon: Calendar,
    },
    {
      title: t("properties"),
      href: `/en/dashboard/properties`,
      icon: Building2,
    },
    {
      title: t("availability"),
      href: `/en/dashboard/availability`,
      icon: Clock,
    },
    {
      title: t("analytics"),
      href: `/en/dashboard/analytics`,
      icon: BarChart3,
    },
    {
      title: t("settings"),
      href: `/en/dashboard/settings`,
      icon: Settings,
    },
  ];

  // Add admin link for admin users
  if (session?.user?.role === "ADMIN") {
    navItems.push({
      title: t("admin"),
      href: `/en/dashboard/admin`,
      icon: ShieldCheck,
    });
  }

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
