export type StaffStatus = "Active" | "On Break" | "Off-duty";

export interface Staff {
  id: string;
  name: string;
  role: string;
  status: StaffStatus;
  servicesAssigned: string[];
  commissionRate: number; // e.g. 0.15 = 15%
  bookingsCompleted: number;
  revenueGenerated: number; // raw rupees, no formatting
}

export const staff: Staff[] = [
  {
    id: "st-01",
    name: "Ananya",
    role: "Senior Stylist",
    status: "Active",
    servicesAssigned: ["Precision Haircut & Style", "Keratin Smoothing"],
    commissionRate: 0.18,
    bookingsCompleted: 142,
    revenueGenerated: 386400,
  },
  {
    id: "st-02",
    name: "Kabir",
    role: "Massage Therapist",
    status: "Active",
    servicesAssigned: ["Deep Tissue Massage", "Hot Stone Therapy"],
    commissionRate: 0.15,
    bookingsCompleted: 98,
    revenueGenerated: 298700,
  },
  {
    id: "st-03",
    name: "Divya",
    role: "Hair Specialist",
    status: "On Break",
    servicesAssigned: ["Keratin Smoothing", "Bridal Glow Package"],
    commissionRate: 0.2,
    bookingsCompleted: 76,
    revenueGenerated: 412300,
  },
  {
    id: "st-04",
    name: "Ishani",
    role: "Nail Artist",
    status: "Off-duty",
    servicesAssigned: ["Gel Manicure", "Restorative Pedicure"],
    commissionRate: 0.12,
    bookingsCompleted: 121,
    revenueGenerated: 156900,
  },
];
