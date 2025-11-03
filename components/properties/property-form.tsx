"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const propertyFormSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.string(),
  defaultPrice: z.number().positive(),
  isActive: z.boolean(),
});

type PropertyFormData = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
  property?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PropertyForm({
  property,
  onSuccess,
  onCancel,
}: PropertyFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: property
      ? {
          name: property.name,
          description: property.description || "",
          type: property.type,
          defaultPrice: Number(property.defaultPrice),
          isActive: property.isActive,
        }
      : {
          name: "",
          description: "",
          type: "CHALET",
          defaultPrice: 100,
          isActive: true,
        },
  });

  const isActive = watch("isActive");

  const onSubmit = async (data: PropertyFormData) => {
    setIsLoading(true);
    try {
      const url = property
        ? `/api/properties/${property.id}`
        : "/api/properties";
      const method = property ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save property");
      }

      toast({
        title: t("common.success"),
        description: property
          ? t("properties.propertyUpdated")
          : t("properties.propertyCreated"),
      });

      onSuccess();
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t("properties.name")}</Label>
        <Input id="name" {...register("name")} disabled={isLoading} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("properties.description")}</Label>
        <Input
          id="description"
          {...register("description")}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">{t("properties.type")}</Label>
          <Input id="type" {...register("type")} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPrice">{t("properties.defaultPrice")}</Label>
          <Input
            id="defaultPrice"
            type="number"
            step="0.01"
            {...register("defaultPrice", { valueAsNumber: true })}
            disabled={isLoading}
          />
          {errors.defaultPrice && (
            <p className="text-sm text-destructive">
              {errors.defaultPrice.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(checked) =>
            setValue("isActive", checked as boolean)
          }
          disabled={isLoading}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          {t("properties.isActive")}
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? t("common.loading") : t("common.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
