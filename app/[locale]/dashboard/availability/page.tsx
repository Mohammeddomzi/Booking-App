"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import { BookingStatus } from "@prisma/client";

interface Booking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  deposit: number;
  status: BookingStatus;
  notes?: string;
  property: {
    id: string;
    name: string;
  };
}

export default function AvailabilityPage() {
  const t = useTranslations();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("ALL");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedDayBookings, setSelectedDayBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [currentMonth, selectedProperty]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties?isActive=true");
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const from = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const to = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      let url = `/api/bookings?from=${from}&to=${to}`;
      if (selectedProperty !== "ALL") {
        url += `&propertyId=${selectedProperty}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      // Convert date strings to Date objects
      const bookingsWithDates = data.map((booking: any) => ({
        ...booking,
        date: new Date(booking.date),
      }));

      setBookings(bookingsWithDates);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast({
        title: t("common.error"),
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => isSameDay(booking.date, date));
  };

  const getStatusVariant = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, any> = {
      PENDING: "pending",
      CONFIRMED: "confirmed",
      PAID: "paid",
      CANCELLED: "cancelled",
      NO_SHOW: "no_show",
      COMPLETED: "completed",
    };
    return statusMap[status] || "default";
  };

  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;

    const dayBookings = getBookingsForDate(date);
    setSelectedDate(date);
    setSelectedDayBookings(dayBookings);
  };

  const bookedDates = bookings.map((booking) => booking.date);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("availability.title")}</h1>

        <div className="w-64">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("bookings.allProperties")}</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("availability.calendarView")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("availability.clickDayToView")}
          </p>
        </CardHeader>
        <CardContent className="p-6 flex justify-center">
          <div className="space-y-4 w-full max-w-3xl">
            <Calendar
              mode="single"
              onSelect={handleDayClick}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="w-full border-0"
              classNames={{
                months: "w-full",
                month: "w-full space-y-3",
                caption: "flex justify-center pt-1 relative items-center mb-4",
                caption_label: "text-lg font-bold",
                nav: "absolute w-full flex justify-between items-center",
                nav_button:
                  "h-9 w-9 bg-background border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110 flex items-center justify-center",
                nav_button_previous: "absolute left-0",
                nav_button_next: "absolute right-0",
                table: "w-full border-collapse border-spacing-1.5",
                head_row: "flex w-full",
                head_cell:
                  "flex-1 font-semibold text-xs text-muted-foreground h-8 flex items-center justify-center",
                row: "flex w-full mt-1.5",
                cell: "flex-1 p-0.5 relative",
                day: "h-full w-full aspect-square text-sm font-medium rounded-lg transition-all hover:scale-105 hover:shadow-lg hover:bg-accent",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground font-bold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-30",
                day_hidden: "invisible",
              }}
              modifiers={{
                booked: bookedDates,
              }}
              modifiersClassNames={{
                booked:
                  "!bg-green-500/10 dark:!bg-green-500/20 !font-bold !border-2 !border-green-500 !shadow-sm",
              }}
            />
            <div className="flex items-center justify-center gap-3 text-sm pt-3 border-t">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                <div className="w-3.5 h-3.5 border-2 border-green-500 bg-green-500/20 rounded"></div>
                <span className="font-medium text-foreground text-xs">
                  {t("availability.hasBookings")}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDate, "PPPP")}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("availability.noBookingsForDay")}
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {booking.customerName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {booking.property.name}
                          </p>
                        </div>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {t(`status.${booking.status}`)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            {t("bookings.time")}:
                          </span>{" "}
                          <span className="font-medium">
                            {booking.startTime.slice(0, 5)} -{" "}
                            {booking.endTime?.slice(0, 5)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("bookings.customerPhone")}:
                          </span>{" "}
                          <span className="font-medium">
                            {booking.customerPhone}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("bookings.totalAmount")}:
                          </span>{" "}
                          <span className="font-medium">
                            {booking.totalAmount.toString()} SAR
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {t("bookings.deposit")}:
                          </span>{" "}
                          <span className="font-medium">
                            {booking.deposit.toString()} SAR
                          </span>
                        </div>
                      </div>
                      {booking.notes && (
                        <div className="pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            {t("bookings.notes")}:
                          </span>
                          <p className="text-sm mt-1">{booking.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
