import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect(`/en/dashboard`);
  }
  
  redirect(`/en/auth/signup`);
}
