// =====================================================================
// Domain types — mirrors prisma/schema.prisma.
//
// Conventions used when going from Prisma -> frontend DTOs:
//   - Decimal   -> number
//   - DateTime  -> ISO string
//   - BigInt/Uuid/Int ids -> string (safe for JSON + React keys)
//   - Prisma enums -> string-literal unions using the exact enum member
//     names from schema.prisma (not the @@map'd db value)
//   - Free-form `String` status/type columns (Invoice.status,
//     Payment.status, Campaign.channel, etc.) -> the conventional value
//     set used across the schema/seeders, documented per field
// =====================================================================

// ---------------------------------------------------------------------
// Enums (schema.prisma)
// ---------------------------------------------------------------------

export type UserRole =
  | "global"
  | "super_admin"
  | "owner"
  | "manager"
  | "receptionist"
  | "stylist"
  | "staff";

export type TeamGroup =
  | "frontOfHouse"
  | "hairTeam"
  | "skinCare"
  | "bodyWellness"
  | "nailCare"
  | "support";

export type EmploymentType = "full_time" | "part_time" | "hybrid" | "service_based" | "hourly_paid";

export type EmploymentStatus = "active" | "on_probation" | "on_leave" | "suspended" | "resigned" | "terminated";

export type AppointmentStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

export type ServiceExecutionType = "sequential" | "parallel";

export type PackageDiscountType = "flat" | "percentage" | "none";

export type UnitOfMeasure = "ml" | "l" | "g" | "kg" | "unit" | "pair" | "box" | "bottle" | "sachet";

export type ProductUsageType = "retail" | "back_bar" | "both";

export type StockLocationType = "retail_floor" | "back_bar";

export type PurchaseOrderStatus = "draft" | "submitted" | "partially_received" | "received" | "cancelled";

export type InventoryAlertStatus = "open" | "acknowledged" | "resolved";

// Free-form VarChar columns — value sets follow schema comments/seeders.
export type InvoiceStatus = "unpaid" | "partially_paid" | "paid" | "refunded" | "void";
export type PaymentTxnStatus = "success" | "pending" | "failed" | "refunded";
export type PaymentMethod = "cash" | "card" | "upi" | "wallet" | "bank_transfer" | "cheque";
export type CampaignStatus = "draft" | "scheduled" | "sent" | "cancelled";
export type CampaignChannel = "SMS" | "WhatsApp" | "Email";
export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed";
export type LoyaltyTxnType = "earn" | "redeem" | "expire" | "adjustment";
export type MembershipTier = "none" | "silver" | "gold" | "platinum";

// ---------------------------------------------------------------------
// 1-2. Tenant / Branch (Tenant, Branch models)
// ---------------------------------------------------------------------

export type SalonTheme = "luxury" | "modern" | "budget";

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

// UI-facing merge of Tenant (branding/business info) + its primary Branch
// (address/hours) — the onboarding flow captures both in one form.
export interface SalonProfile {
  name: string; // Tenant.name
  category: string; // maps to BusinessModelSubtype label at onboarding time
  phone: string; // Branch.phone
  email: string; // not modeled on Tenant/Branch yet — kept for contact use
  address: string; // Branch.addressLine
  city: string; // Branch.city
  theme: SalonTheme; // stored in Tenant.branding (Json)
  openTime: string; // derived from Branch.workingHours
  closeTime: string; // derived from Branch.workingHours
  workingDays: string[]; // derived from Branch.workingHours
  onboarded: boolean;
  branches?: Branch[];
}

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

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  addressLine?: string;
  city?: string;
  branchCode?: string;
  phone?: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------
// 2b. Staff (User + StaffProfile + TeamRole, UI-safe subset only —
// payroll/KYC/banking fields on StaffProfile are intentionally omitted,
// they belong to a payroll-scoped view, not the general staff list)
// ---------------------------------------------------------------------

export type StaffStatus = "Active" | "On Break" | "Off-duty";

export interface StaffMember {
  id: string; // StaffProfile.id
  userId: string; // User.id
  branchId?: string;
  fullName: string; // User.fullName
  employeeCode?: string; // StaffProfile.employeeCode
  designation: string; // StaffProfile.designation (e.g. "Senior Stylist")
  roleGroup: TeamGroup; // TeamRole.group this designation belongs to
  status: StaffStatus; // UI-only shift status, not persisted on StaffProfile
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  skills: string[]; // StaffProfile.skills — service/specialty tags
  serviceIds: string[]; // ServiceStaffMap
  commissionPct: number; // StaffProfile.commissionPct
  ratingAvg: number; // StaffProfile.ratingAvg
  joinedOn?: string; // StaffProfile.joinedOn
  bookingsCompleted: number; // derived (count of completed Appointments)
  revenueGenerated: number; // derived (sum of finalPrice on completed Appointments)
}

// ---------------------------------------------------------------------
// 3. Customer / CustomerMembership
// ---------------------------------------------------------------------

export type CustomerStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  tenantId: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say" | "";
  dateOfBirth?: string; // YYYY-MM-DD
  notes?: string;
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  preferredServiceIds?: string[];
  preferredStaffId?: string;
  preferredTimeSlot?: "Morning" | "Afternoon" | "Evening" | "";
  address?: string;
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;

  // Derived/reporting fields (not columns on Customer — computed from
  // Appointment/Invoice history, kept here for the UI's convenience)
  visits: number;
  lastVisit?: string;
  totalSpend: number;
  favoriteServiceId?: string;
  status: CustomerStatus;
}

// Back-compat alias for the old `Client` name used across the UI.
export type Client = Customer;

// ---------------------------------------------------------------------
// 4. Services (ServiceCategory, Service, ServiceVariation, Addon)
// ---------------------------------------------------------------------

export interface ServiceCategory {
  id: string;
  tenantId?: string; // null/absent = global category
  name: string;
}

export interface ServiceVariation {
  id: string;
  groupId: string;
  name: string; // e.g. "60 min"
  priceModifier: number;
  durationModifierMins: number;
}

export interface ServiceVariationGroup {
  id: string;
  serviceId: string;
  name: string; // e.g. "Duration"
  selectionType: "single" | "multiple";
  variations: ServiceVariation[];
}

export interface Addon {
  id: string;
  tenantId?: string;
  name: string;
  price: number;
  durationMins: number;
}

export interface Service {
  id: string;
  tenantId?: string;
  categoryId: string;
  categoryName: string; // denormalized for list/filter UI
  name: string;
  description?: string;
  price: number; // Service.price — selling price
  displayPrice?: number; // Service.displayPrice — struck-through "was" price
  durationMins: number;
  isActive: boolean;
  imageUrl?: string;
  variationGroups?: ServiceVariationGroup[];
  addonIds?: string[];
}

// ---------------------------------------------------------------------
// 5. Appointments (BookingGroup, Appointment)
// ---------------------------------------------------------------------

export interface BookingGroup {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  tenantId: string;
  branchId: string;
  customerId: string;
  customerName: string; // denormalized for list UI
  staffId?: string;
  staffName?: string; // denormalized for list UI
  serviceId: string;
  serviceName: string; // denormalized for list UI
  bookingGroupId?: string;
  executionType: ServiceExecutionType;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  status: AppointmentStatus;
  source: string; // "staff" | "online" | "walk_in" ...
  notes?: string;
  basePrice: number;
  finalPrice: number;
  totalDurationMins: number;
  isPartOfPackage: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------
// 6. Billing (Invoice, InvoiceItem, Payment)
// ---------------------------------------------------------------------

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  itemType: "service" | "product" | "package";
  referenceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  referenceNo?: string;
  status: PaymentTxnStatus;
  paidAt: string;
}

export interface Invoice {
  id: string;
  tenantId: string;
  branchId: string;
  appointmentId?: string;
  customerId: string;
  customerName: string; // denormalized
  invoiceNumber: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
}

// ---------------------------------------------------------------------
// 7. Inventory (ProductCategory, Supplier, Product, BranchProductStock,
// InventoryAlert)
// ---------------------------------------------------------------------

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstNumber?: string;
  paymentTerms?: string;
  categories: string[]; // UI-only grouping, derived from products supplied
  isActive: boolean;
}

export interface ProductCategory {
  id: string;
  tenantId?: string;
  name: string;
}

export interface Product {
  id: string;
  tenantId: string;
  categoryId?: string;
  categoryName: string; // denormalized
  preferredSupplierId?: string;
  name: string;
  brand?: string;
  sku?: string;
  barcode?: string;
  unit: UnitOfMeasure;
  usageType: ProductUsageType;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;

  // Denormalized from BranchProductStock for the single-branch admin UI —
  // a multi-branch view would fetch BranchProductStock rows per branch.
  quantity: number;
  parLevel: number;
}

export interface InventoryAlert {
  id: string;
  branchId: string;
  productId: string;
  productName: string;
  locationType: StockLocationType;
  currentQty: number;
  parLevel: number;
  status: InventoryAlertStatus;
  triggeredAt: string;
}

// ---------------------------------------------------------------------
// 8. Marketing & Loyalty (LoyaltyTransaction, Campaign, CampaignRecipient)
// ---------------------------------------------------------------------

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  type: LoyaltyTxnType;
  referenceId?: string;
  createdAt: string;
}

export interface CampaignRecipient {
  id: string;
  campaignId: string;
  customerId: string;
  deliveryStatus: DeliveryStatus;
  sentAt?: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  channel: CampaignChannel;
  messageTemplate: string;
  status: CampaignStatus;
  scheduledAt?: string;
  recipientCount: number;
  createdAt: string;
}

