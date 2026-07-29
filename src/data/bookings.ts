export type BookingStatus = "Confirmed" | "In progress" | "Pending" | "Completed" | "Cancelled";

export interface Booking {
  id: string;
  client: string;
  service: string;
  stylist: string;
  date: string;
  time: string;
  price: string;
  status: BookingStatus;
}

export const bookings: Booking[] = [
  { id: "bk-1001", client: "Priya Nair", service: "Signature Facial", stylist: "Ananya", date: "2026-07-29", time: "10:00 AM", price: "₹3,200", status: "Confirmed" },
  { id: "bk-1002", client: "Rohan Kapoor", service: "Deep Tissue Massage", stylist: "Kabir", date: "2026-07-29", time: "11:15 AM", price: "₹2,800", status: "In progress" },
  { id: "bk-1003", client: "Meera Sharma", service: "Keratin Smoothing", stylist: "Divya", date: "2026-07-29", time: "12:30 PM", price: "₹6,500", status: "Confirmed" },
  { id: "bk-1004", client: "Devika Rao", service: "Gel Manicure", stylist: "Ishani", date: "2026-07-29", time: "2:00 PM", price: "₹1,100", status: "Pending" },
  { id: "bk-1005", client: "Kabir Sen", service: "Precision Haircut & Style", stylist: "Ananya", date: "2026-07-29", time: "3:30 PM", price: "₹1,400", status: "Confirmed" },
  { id: "bk-1006", client: "Arjun Malhotra", service: "Hot Stone Therapy", stylist: "Kabir", date: "2026-07-28", time: "4:45 PM", price: "₹3,600", status: "Completed" },
  { id: "bk-1007", client: "Sana Iyer", service: "Restorative Pedicure", stylist: "Ishani", date: "2026-07-28", time: "5:15 PM", price: "₹1,500", status: "Completed" },
  { id: "bk-1008", client: "Neha Bhatt", service: "Bridal Glow Package", stylist: "Divya", date: "2026-07-30", time: "9:00 AM", price: "₹14,000", status: "Pending" },
  { id: "bk-1009", client: "Farhan Ali", service: "Precision Haircut & Style", stylist: "Ananya", date: "2026-07-27", time: "1:00 PM", price: "₹1,400", status: "Cancelled" },
];
