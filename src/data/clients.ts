export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  visits: number;
  lastVisit: string;
  totalSpend: string;
  favoriteService: string;
  status: "Active" | "Inactive";
}

export const clients: Client[] = [
  { id: "cl-01", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 98200 11122", visits: 14, lastVisit: "2026-07-29", totalSpend: "₹42,300", favoriteService: "Signature Facial", status: "Active" },
  { id: "cl-02", name: "Rohan Kapoor", email: "rohan.kapoor@example.com", phone: "+91 98200 33344", visits: 9, lastVisit: "2026-07-29", totalSpend: "₹24,900", favoriteService: "Deep Tissue Massage", status: "Active" },
  { id: "cl-03", name: "Meera Sharma", email: "meera.sharma@example.com", phone: "+91 98200 55566", visits: 21, lastVisit: "2026-07-29", totalSpend: "₹1,08,400", favoriteService: "Keratin Smoothing", status: "Active" },
  { id: "cl-04", name: "Devika Rao", email: "devika.rao@example.com", phone: "+91 98200 77788", visits: 5, lastVisit: "2026-07-29", totalSpend: "₹7,200", favoriteService: "Gel Manicure", status: "Active" },
  { id: "cl-05", name: "Kabir Sen", email: "kabir.sen@example.com", phone: "+91 98200 99900", visits: 3, lastVisit: "2026-07-29", totalSpend: "₹4,100", favoriteService: "Precision Haircut & Style", status: "Active" },
  { id: "cl-06", name: "Arjun Malhotra", email: "arjun.malhotra@example.com", phone: "+91 98201 11223", visits: 2, lastVisit: "2026-07-28", totalSpend: "₹5,900", favoriteService: "Hot Stone Therapy", status: "Active" },
  { id: "cl-07", name: "Sana Iyer", email: "sana.iyer@example.com", phone: "+91 98201 33445", visits: 12, lastVisit: "2026-07-28", totalSpend: "₹31,600", favoriteService: "Restorative Pedicure", status: "Active" },
  { id: "cl-08", name: "Neha Bhatt", email: "neha.bhatt@example.com", phone: "+91 98201 55667", visits: 1, lastVisit: "2026-07-15", totalSpend: "₹14,000", favoriteService: "Bridal Glow Package", status: "Active" },
  { id: "cl-09", name: "Farhan Ali", email: "farhan.ali@example.com", phone: "+91 98201 77889", visits: 6, lastVisit: "2026-05-02", totalSpend: "₹9,800", favoriteService: "Precision Haircut & Style", status: "Inactive" },
];
