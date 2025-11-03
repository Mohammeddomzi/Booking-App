import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/nav";
import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }

  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <DashboardHeader locale={locale} />
          <div className="flex">
            <aside className="hidden w-64 border-e bg-card md:block">
              <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-6">
                <DashboardNav locale={locale} />
              </div>
            </aside>
            <main className="flex-1 p-6">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
