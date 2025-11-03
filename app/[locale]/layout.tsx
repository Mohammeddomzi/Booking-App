import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Inter, Cairo } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export const metadata = {
  title: "Aurora Chalet - إدارة حجوزات الشاليهات والمسابح",
  description: "نظام إدارة حجوزات الشاليهات والمسابح الخاصة",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontClass = locale === "ar" ? cairo.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={fontClass}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
