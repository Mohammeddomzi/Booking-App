import { redirect } from "next/navigation";

export default function SettingsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  redirect(`/en/dashboard/settings/organization`);
}
