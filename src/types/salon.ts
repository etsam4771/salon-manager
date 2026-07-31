export type SalonTheme = "luxury" | "modern" | "budget";

export interface SalonProfile {
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  theme: SalonTheme;
  openTime: string;
  closeTime: string;
  workingDays: string[];
  onboarded: boolean;
}

export const themeMeta: Record<SalonTheme, { label: string; blurb: string; swatches: string[] }> = {
  luxury: {
    label: "Luxury",
    blurb: "Black + gold. Premium, editorial, high-end spas.",
    swatches: ["#0F172A", "#D97706", "#FAFAF9"],
  },
  modern: {
    label: "Modern",
    blurb: "White + pastel. Clean, calm, boutique salons.",
    swatches: ["#1E293B", "#0D9488", "#FFFFFF"],
  },
  budget: {
    label: "Vibrant",
    blurb: "Bright accents. Bold, energetic, walk-in friendly.",
    swatches: ["#2563EB", "#7C3AED", "#F1F5F9"],
  },
};

export const defaultSalonProfile: SalonProfile = {
  name: "Elanova",
  category: "Unisex Salon & Spa",
  phone: "",
  email: "",
  address: "",
  city: "",
  theme: "modern",
  openTime: "09:00",
  closeTime: "20:00",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  onboarded: true,
};

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';
  dob?: string; // YYYY-MM-DD
  address?: string;
  preferredServices?: string[];
  preferredStaffId?: string;
  preferredStaffName?: string;
  preferredTimeSlot?: 'Morning' | 'Afternoon' | 'Evening' | '';
  notes?: string;
  profilePhotoUrl?: string;
  createdAt?: string;
}
