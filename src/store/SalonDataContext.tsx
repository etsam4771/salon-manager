import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { appointments as seedAppointments } from "../data/appointments";
import { customers as seedCustomers } from "../data/customers";
import { services as allServices } from "../data/services";
import { staff as seedStaff } from "../data/staff";
import { products as seedProducts, inventoryAlerts as seedInventoryAlerts } from "../data/inventory";
import type {
  Appointment,
  AppointmentStatus,
  Campaign,
  CampaignChannel,
  Customer,
  Invoice,
  InvoiceItem,
  InventoryAlert,
  LoyaltyTransaction,
  Payment,
  PaymentMethod,
  Product,
  SalonProfile,
  StaffMember,
  StaffStatus,
} from "../types/salon";

const APPOINTMENTS_KEY = "salon:appointments";
const CUSTOMERS_KEY = "salon:customers";
const PROFILE_KEY = "salon:profile";
const STAFF_KEY = "salon:staff";
const PRODUCTS_KEY = "salon:products";
const INVENTORY_ALERTS_KEY = "salon:inventory_alerts";
const INVOICES_KEY = "salon:invoices";
const CAMPAIGNS_KEY = "salon:campaigns";
const LOYALTY_TXNS_KEY = "salon:loyalty_txns";

const DEFAULT_TENANT_ID = "tn-01";
const DEFAULT_BRANCH_ID = "br-01";

function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // fall through to seed data
  }
  return seed;
}

function loadProfile(): SalonProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SalonProfile) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// Input shapes for the mutation helpers below
// ---------------------------------------------------------------------

export interface NewAppointmentInput {
  // Either an existing customer id, or details for a brand-new customer.
  customerId?: string;
  newCustomer?: { name: string; email: string; phone: string };
  serviceIds: string[];
  stylist: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}

export interface InvoiceLineInput {
  itemType: "service" | "product";
  referenceId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  stylist?: string;
}

export interface NewInvoiceInput {
  customerId?: string;
  customerName: string;
  lines: InvoiceLineInput[];
  discountLabel: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
}

export interface NewCampaignInput {
  name: string;
  channel: CampaignChannel;
  messageTemplate: string;
  recipientCount: number;
}

interface SalonDataContextValue {
  appointments: Appointment[];
  customers: Customer[];
  addAppointment: (input: NewAppointmentInput) => Appointment;
  rescheduleAppointment: (id: string, newDate: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateCustomerNotes: (id: string, notes: string) => void;

  salonProfile: SalonProfile | null;
  isOnboarded: boolean;
  saveSalonProfile: (profile: SalonProfile) => void;

  staff: StaffMember[];
  updateStaffStatus: (id: string, status: StaffStatus) => void;

  products: Product[];
  inventoryAlerts: InventoryAlert[];
  adjustStock: (id: string, delta: number) => void;

  invoices: Invoice[];
  createInvoice: (input: NewInvoiceInput) => Invoice;

  campaigns: Campaign[];
  sendCampaign: (input: NewCampaignInput) => Campaign;

  loyaltyTransactions: LoyaltyTransaction[];
}

// eslint-disable-next-line react-refresh/only-export-components
export const SalonDataContext = createContext<SalonDataContextValue | undefined>(undefined);

export function SalonDataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    loadOrSeed(APPOINTMENTS_KEY, seedAppointments)
  );
  const [customers, setCustomers] = useState<Customer[]>(() => loadOrSeed(CUSTOMERS_KEY, seedCustomers));
  const [staffList, setStaffList] = useState<StaffMember[]>(() => loadOrSeed(STAFF_KEY, seedStaff));
  const [products, setProducts] = useState<Product[]>(() => loadOrSeed(PRODUCTS_KEY, seedProducts));
  const [inventoryAlerts] = useState<InventoryAlert[]>(() =>
    loadOrSeed(INVENTORY_ALERTS_KEY, seedInventoryAlerts)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadOrSeed(INVOICES_KEY, []));
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadOrSeed(CAMPAIGNS_KEY, []));
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>(() =>
    loadOrSeed(LOYALTY_TXNS_KEY, [])
  );
  // null (not the demo default) until an owner actually completes onboarding —
  // this is what lets the app tell "already set up" apart from "brand new tenant".
  const [salonProfile, setSalonProfile] = useState<SalonProfile | null>(() => loadProfile());

  useEffect(() => {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_ALERTS_KEY, JSON.stringify(inventoryAlerts));
  }, [inventoryAlerts]);

  useEffect(() => {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem(LOYALTY_TXNS_KEY, JSON.stringify(loyaltyTransactions));
  }, [loyaltyTransactions]);

  useEffect(() => {
    if (salonProfile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(salonProfile));
    }
  }, [salonProfile]);

  const saveSalonProfile = useCallback((profile: SalonProfile) => {
    setSalonProfile(profile);
  }, []);

  const updateStaffStatus = useCallback((id: string, status: StaffStatus) => {
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p))
    );
  }, []);

  const awardLoyaltyPoints = useCallback((customerId: string, points: number, referenceId?: string) => {
    setLoyaltyTransactions((prev) => [
      {
        id: `loy-${Date.now()}`,
        customerId,
        points,
        type: "earn",
        referenceId,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + points } : c))
    );
  }, []);

  const addAppointment = useCallback(
    (input: NewAppointmentInput): Appointment => {
      const selectedServices = allServices.filter((s) => input.serviceIds.includes(s.id));
      const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
      const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMins, 0);

      let customerId = input.customerId ?? "";
      let customerName = "";

      setCustomers((prev) => {
        if (input.customerId) {
          // Existing customer — bump their visit stats.
          return prev.map((c) =>
            c.id === input.customerId
              ? {
                ...c,
                visits: c.visits + 1,
                lastVisit: input.date,
                totalSpend: c.totalSpend + totalPrice,
                updatedAt: new Date().toISOString(),
              }
              : c
          );
        }

        if (input.newCustomer) {
          const newId = `cl-${Date.now()}`;
          customerId = newId;
          customerName = input.newCustomer.name;
          const newCustomer: Customer = {
            id: newId,
            tenantId: DEFAULT_TENANT_ID,
            fullName: input.newCustomer.name,
            email: input.newCustomer.email,
            phone: input.newCustomer.phone,
            loyaltyPoints: 0,
            membershipTier: "none",
            visits: 1,
            lastVisit: input.date,
            totalSpend: totalPrice,
            favoriteServiceId: selectedServices[0]?.id,
            status: "Active",
            notes: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return [newCustomer, ...prev];
        }

        return prev;
      });

      if (!customerName) {
        customerName = customers.find((c) => c.id === input.customerId)?.fullName ?? "Unknown customer";
      }

      const staffMember = staffList.find((s) => s.fullName === input.stylist);
      const startTime = `${input.date}T${input.time}:00`;

      const appointment: Appointment = {
        id: `apt-${Date.now()}`,
        tenantId: DEFAULT_TENANT_ID,
        branchId: DEFAULT_BRANCH_ID,
        customerId,
        customerName,
        staffId: staffMember?.id,
        staffName: input.stylist,
        serviceId: selectedServices[0]?.id ?? "",
        serviceName: selectedServices.map((s) => s.name).join(", "),
        executionType: "sequential",
        startTime,
        endTime: startTime,
        status: input.status,
        source: "staff",
        basePrice: totalPrice,
        finalPrice: totalPrice,
        totalDurationMins: totalDuration,
        isPartOfPackage: selectedServices.length > 1,
        createdAt: new Date().toISOString(),
      };

      setAppointments((prev) => [appointment, ...prev]);
      return appointment;
    },
    [customers, staffList]
  );

  const createInvoice = useCallback(
    (input: NewInvoiceInput): Invoice => {
      const now = new Date().toISOString();
      const invoiceId = `inv-${Date.now()}`;

      const items: InvoiceItem[] = input.lines.map((line, idx) => ({
        id: `${invoiceId}-item-${idx}`,
        invoiceId,
        itemType: line.itemType,
        referenceId: line.referenceId,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.unitPrice * line.quantity,
      }));

      const payment: Payment = {
        id: `${invoiceId}-pay-1`,
        invoiceId,
        method: input.paymentMethod,
        amount: input.totalAmount,
        status: "success",
        paidAt: now,
      };

      const invoice: Invoice = {
        id: invoiceId,
        tenantId: DEFAULT_TENANT_ID,
        branchId: DEFAULT_BRANCH_ID,
        customerId: "1",//input.customerId??null,
        customerName: input.customerName,
        invoiceNumber: invoiceId.toUpperCase(),
        subtotal: input.subtotal,
        discountAmount: input.discountAmount,
        taxAmount: input.taxAmount,
        totalAmount: input.totalAmount,
        status: "paid",
        items,
        payments: [payment],
        createdAt: now,
      };

      setInvoices((prev) => [invoice, ...prev]);

      // Decrement stock for any product lines sold.
      setProducts((prev) =>
        prev.map((p) => {
          const line = input.lines.find((l) => l.itemType === "product" && l.referenceId === p.id);
          return line ? { ...p, quantity: Math.max(0, p.quantity - line.quantity) } : p;
        })
      );

      // Bump the assigned customer's stats and award loyalty points, same
      // as an appointment would.
      if (input.customerId) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === input.customerId
              ? {
                ...c,
                visits: c.visits + 1,
                lastVisit: now.slice(0, 10),
                totalSpend: c.totalSpend + input.totalAmount,
                updatedAt: now,
              }
              : c
          )
        );
        awardLoyaltyPoints(input.customerId, Math.floor(input.totalAmount / 100), invoiceId);
      }

      return invoice;
    },
    [awardLoyaltyPoints]
  );

  const rescheduleAppointment = useCallback((id: string, newDate: string) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const time = a.startTime.slice(11);
        return { ...a, startTime: `${newDate}T${time}`, endTime: `${newDate}T${a.endTime.slice(11)}` };
      })
    );
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const updateCustomerNotes = useCallback((id: string, notes: string) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, notes } : c)));
  }, []);

  const sendCampaign = useCallback((input: NewCampaignInput): Campaign => {
    const campaign: Campaign = {
      ...input,
      id: `cmp-${Date.now()}`,
      tenantId: DEFAULT_TENANT_ID,
      status: "sent",
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [campaign, ...prev]);
    return campaign;
  }, []);

  const value = useMemo<SalonDataContextValue>(
    () => ({
      appointments,
      customers,
      addAppointment,
      rescheduleAppointment,
      updateAppointmentStatus,
      updateCustomerNotes,
      salonProfile,
      isOnboarded: Boolean(salonProfile),
      saveSalonProfile,
      staff: staffList,
      updateStaffStatus,
      products,
      inventoryAlerts,
      adjustStock,
      invoices,
      createInvoice,
      campaigns,
      sendCampaign,
      loyaltyTransactions,
    }),
    [
      appointments,
      customers,
      addAppointment,
      rescheduleAppointment,
      updateAppointmentStatus,
      updateCustomerNotes,
      salonProfile,
      saveSalonProfile,
      staffList,
      updateStaffStatus,
      products,
      inventoryAlerts,
      adjustStock,
      invoices,
      createInvoice,
      campaigns,
      sendCampaign,
      loyaltyTransactions,
    ]
  );

  return <SalonDataContext.Provider value={value}>{children}</SalonDataContext.Provider>;
}
