import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Aurora Chalet - إدارة حجوزات الشاليهات والمسابح",
  description: "نظام إدارة حجوزات الشاليهات والمسابح الخاصة",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

