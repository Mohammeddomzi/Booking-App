import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const bookingSchema = z.object({
  date: z.string().or(z.date()),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format")
    .optional(),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  totalAmount: z.number().positive("Total amount must be positive"),
  deposit: z.number().min(0, "Deposit cannot be negative").default(0),
  notes: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
  status: z.nativeEnum(BookingStatus).default(BookingStatus.PENDING),
  propertyId: z.string().cuid(),
});

export const propertySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  type: z.string().default("CHALET"),
  defaultPrice: z.number().positive("Price must be positive"),
  currency: z.string().default("SAR"),
  slotDuration: z
    .number()
    .positive("Slot duration must be positive")
    .default(60),
  isActive: z.boolean().default(true),
});

export const availabilitySchema = z.object({
  date: z.string().or(z.date()),
  isOpen: z.boolean().default(true),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .optional(),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/)
    .optional(),
  slotDuration: z.number().positive().optional(),
  propertyId: z.string().cuid(),
});

export const organizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Organization name required"),
  organizationSlug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
