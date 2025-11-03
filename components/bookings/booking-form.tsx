"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookingStatus } from "@prisma/client";
import { Camera, Plus, Minus } from "lucide-react";
import { format } from "date-fns";

const bookingFormSchema = z.object({
  date: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  totalAmount: z.number().positive(),
  deposit: z.number().min(0),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
  status: z.nativeEnum(BookingStatus),
  propertyId: z.string(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  booking?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookingForm({
  booking,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: booking
      ? {
          date: format(new Date(booking.date), "yyyy-MM-dd"),
          startTime: booking.startTime.substring(0, 5),
          endTime: booking.endTime?.substring(0, 5),
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          totalAmount: Number(booking.totalAmount),
          deposit: Number(booking.deposit),
          notes: booking.notes || "",
          receiptUrl: booking.receiptUrl || "",
          status: booking.status,
          propertyId: booking.propertyId,
        }
      : {
          date: format(new Date(), "yyyy-MM-dd"),
          startTime: "12:00",
          customerName: "",
          customerPhone: "",
          totalAmount: 0,
          deposit: 0,
          notes: "",
          receiptUrl: "",
          status: BookingStatus.PENDING,
          propertyId: "",
        },
  });

  const totalAmount = watch("totalAmount");
  const deposit = watch("deposit");
  const receiptUrl = watch("receiptUrl");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?isActive=true");
      const data = await response.json();
      setProperties(data);
      if (data.length > 0 && !booking) {
        setValue("propertyId", data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      // Get signed URL
      const signedUrlResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name }),
      });

      const { signedUrl } = await signedUrlResponse.json();

      // Upload to Supabase
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Extract the public URL from the signed URL
      const publicUrl = signedUrl.split("?")[0];
      setValue("receiptUrl", publicUrl);

      toast({
        title: t("common.success"),
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    try {
      // Convert time to HH:MM:SS format
      const formattedData = {
        ...data,
        startTime: `${data.startTime}:00`,
        endTime: data.endTime ? `${data.endTime}:00` : undefined,
      };

      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings";
      const method = booking ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save booking");
      }

      toast({
        title: t("common.success"),
        description: booking
          ? t("bookings.bookingUpdated")
          : t("bookings.bookingCreated"),
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
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="propertyId">{t("bookings.property")}</Label>
          <Select
            value={watch("propertyId")}
            onValueChange={(value) => setValue("propertyId", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.propertyId && (
            <p className="text-sm text-destructive">
              {errors.propertyId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t("bookings.status")}</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) =>
              setValue("status", value as BookingStatus)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(BookingStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">{t("bookings.date")}</Label>
          <Input
            id="date"
            type="date"
            {...register("date")}
            disabled={isLoading}
          />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="startTime">{t("bookings.startTime")}</Label>
            <Input
              id="startTime"
              type="time"
              {...register("startTime")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">{t("bookings.endTime")}</Label>
            <Input
              id="endTime"
              type="time"
              {...register("endTime")}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">{t("bookings.customerName")}</Label>
          <Input
            id="customerName"
            {...register("customerName")}
            disabled={isLoading}
          />
          {errors.customerName && (
            <p className="text-sm text-destructive">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">{t("bookings.customerPhone")}</Label>
          <Input
            id="customerPhone"
            dir="ltr"
            {...register("customerPhone")}
            disabled={isLoading}
          />
          {errors.customerPhone && (
            <p className="text-sm text-destructive">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalAmount">{t("bookings.totalAmount")}</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() =>
                setValue("totalAmount", Math.max(0, totalAmount - 50))
              }
              disabled={isLoading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              {...register("totalAmount", { valueAsNumber: true })}
              disabled={isLoading}
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue("totalAmount", totalAmount + 50)}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.totalAmount && (
            <p className="text-sm text-destructive">
              {errors.totalAmount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">{t("bookings.deposit")}</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue("deposit", Math.max(0, deposit - 50))}
              disabled={isLoading}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="deposit"
              type="number"
              step="0.01"
              {...register("deposit", { valueAsNumber: true })}
              disabled={isLoading}
              className="text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setValue("deposit", deposit + 50)}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.deposit && (
            <p className="text-sm text-destructive">{errors.deposit.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{t("bookings.notes")}</Label>
        <Input id="notes" {...register("notes")} disabled={isLoading} />
      </div>

      <div className="space-y-2">
        <Label>{t("bookings.receipt")}</Label>
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || uploadingImage}
            onClick={() => document.getElementById("receipt-upload")?.click()}
          >
            <Camera className="me-2 h-4 w-4" />
            {uploadingImage ? t("common.loading") : t("bookings.uploadReceipt")}
          </Button>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {t("common.view")}
            </a>
          )}
        </div>
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
