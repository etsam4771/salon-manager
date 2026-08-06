import type { AppointmentStatus, InvoiceStatus } from "../types/salon";

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

export function formatTime(iso: string): string {
  return iso.slice(11, 16);
}

const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export function appointmentStatusLabel(status: AppointmentStatus): string {
  return appointmentStatusLabels[status];
}

export const appointmentStatusOptions: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  unpaid: "Unpaid",
  partially_paid: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
  void: "Void",
};

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return invoiceStatusLabels[status];
}
