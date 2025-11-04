import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  redirect(`/${locale}/dashboard/settings/organization`);
}
