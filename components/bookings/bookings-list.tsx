"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookingStatus } from "@prisma/client";
import { Edit, Trash2, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingsListProps {
  onEdit: (booking: any) => void;
}

export function BookingsList({ onEdit }: BookingsListProps) {
  const t = useTranslations();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, propertyFilter, searchQuery]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [bookingsRes, propertiesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/properties"),
      ]);

      const [bookingsData, propertiesData] = await Promise.all([
        bookingsRes.json(),
        propertiesRes.json(),
      ]);

      setBookings(bookingsData);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    if (propertyFilter !== "ALL") {
      filtered = filtered.filter((b) => b.propertyId === propertyFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.customerPhone.includes(searchQuery)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleDelete = async () => {
    if (!bookingToDelete) return;

    try {
      const response = await fetch(`/api/bookings/${bookingToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      toast({
        title: t("common.success"),
        description: t("bookings.bookingDeleted"),
      });

      setBookings(bookings.filter((b) => b.id !== bookingToDelete));
      setDeleteDialogOpen(false);
      setBookingToDelete(null);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return "pending";
      case BookingStatus.CONFIRMED:
        return "confirmed";
      case BookingStatus.PAID:
        return "paid";
      case BookingStatus.CANCELLED:
        return "cancelled";
      case BookingStatus.NO_SHOW:
        return "no_show";
      case BookingStatus.COMPLETED:
        return "completed";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("bookings.title")}</CardTitle>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("bookings.searchBookings")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("bookings.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("bookings.allStatuses")}</SelectItem>
                {Object.values(BookingStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("bookings.filterByProperty")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  {t("bookings.allProperties")}
                </SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("bookings.noBookings")}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("bookings.customerName")}</TableHead>
                    <TableHead>{t("bookings.property")}</TableHead>
                    <TableHead>{t("bookings.date")}</TableHead>
                    <TableHead>{t("bookings.time")}</TableHead>
                    <TableHead>{t("bookings.totalAmount")}</TableHead>
                    <TableHead>{t("bookings.status")}</TableHead>
                    <TableHead className="text-end">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.customerName}
                      </TableCell>
                      <TableCell>{booking.property.name}</TableCell>
                      <TableCell>
                        {new Date(booking.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{booking.startTime.substring(0, 5)}</TableCell>
                      <TableCell>
                        {formatCurrency(Number(booking.totalAmount), "SAR")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(booking.status) as any}
                        >
                          {t(`status.${booking.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setBookingToDelete(booking.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("bookings.deleteBooking")}</DialogTitle>
            <DialogDescription>{t("bookings.confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
