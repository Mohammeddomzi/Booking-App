"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

export default function OrganizationSettingsPage() {
  const t = useTranslations();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  useEffect(() => {
    if (session?.user?.organizationId) {
      fetchOrganization();
    }
  }, [session]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organization`);
      const data = await response.json();
      setOrganization(data);
      setFormData({
        name: data.name,
        slug: data.slug,
      });
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      toast({
        title: t("common.success"),
        description: t("settings.settingsUpdated"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!organization) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.organization")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("settings.organizationName")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">{t("settings.organizationSlug")}</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              disabled={isLoading}
              required
              pattern="[a-z0-9-]+"
            />
            <p className="text-sm text-muted-foreground">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <Label className="text-muted-foreground">
                {t("settings.currentPlan")}
              </Label>
              <p className="font-medium">{organization.plan}</p>
            </div>
            {organization.subscriptionStatus && (
              <div>
                <Label className="text-muted-foreground">
                  {t("settings.subscriptionStatus")}
                </Label>
                <p className="font-medium capitalize">
                  {organization.subscriptionStatus}
                </p>
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("common.loading") : t("common.save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
