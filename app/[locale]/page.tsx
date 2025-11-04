import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect(`/${locale}/dashboard`);
  }
  
  redirect(`/${locale}/auth/signup`);
}
