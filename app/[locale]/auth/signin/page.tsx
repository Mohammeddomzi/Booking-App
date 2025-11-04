"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Languages } from "lucide-react";

export default function SignInPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = useTranslations();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.push(`/${newLocale}/auth/signin`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: t("common.error"),
          description: t("auth.invalidCredentials"),
          variant: "destructive",
        });
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary relative">
      <div className="absolute top-4 end-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLocale}
          className="gap-2"
        >
          <Languages className="h-4 w-4" />
          <span className="font-medium">{locale === "ar" ? "EN" : "AR"}</span>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            {t("common.appName")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("auth.signIn")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.signIn")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {t("auth.noAccount")}{" "}
            </span>
            <Link
              href={`/${locale}/auth/signup`}
              className="text-primary hover:underline"
            >
              {t("auth.signUp")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
