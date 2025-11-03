"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { BookingForm } from "@/components/bookings/booking-form";
import { BookingsList } from "@/components/bookings/bookings-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BookingsPage() {
  const t = useTranslations();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsFormOpen(false);
    setEditingBooking(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("bookings.title")}</h1>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="me-2 h-4 w-4" />
          {t("bookings.newBooking")}
        </Button>
      </div>

      <BookingsList key={refreshKey} onEdit={handleEdit} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBooking
                ? t("bookings.editBooking")
                : t("bookings.newBooking")}
            </DialogTitle>
          </DialogHeader>
          <BookingForm
            booking={editingBooking}
            onSuccess={handleSuccess}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingBooking(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
