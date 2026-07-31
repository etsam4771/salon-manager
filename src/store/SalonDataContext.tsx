import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { bookings as seedBookings, type Booking, type BookingStatus } from "../data/bookings";
import { clients as seedClients, type Client } from "../data/clients";
import { services as allServices } from "../data/services";
import { staff as seedStaff, type Staff, type StaffStatus } from "../data/staff";
import { inventory as seedInventory, type InventoryItem } from "../data/inventory";
import type { SalonProfile } from "../types/salon";

const BOOKINGS_KEY = "salon:bookings";
const CLIENTS_KEY = "salon:clients";
const PROFILE_KEY = "salon:profile";
const STAFF_KEY = "salon:staff";
const INVENTORY_KEY = "salon:inventory";
const SALES_KEY = "salon:sales";

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

export interface NewBookingInput {
  // Either an existing client id, or details for a brand-new client.
  clientId?: string;
  newClient?: { name: string; email: string; phone: string };
  serviceIds: string[];
  stylist: string;
  date: string;
  time: string;
  status: BookingStatus;
}

export interface SaleLine {
  kind: "service" | "product";
  refId: string;
  name: string;
  unitPrice: number;
  qty: number;
  stylist?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName: string;
  lines: SaleLine[];
  discountLabel: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  createdAt: string;
}

export interface NewSaleInput {
  customerId?: string;
  customerName: string;
  lines: SaleLine[];
  discountLabel: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

interface SalonDataContextValue {
  bookings: Booking[];
  clients: Client[];
  addBooking: (input: NewBookingInput) => Booking;
  salonProfile: SalonProfile | null;
  isOnboarded: boolean;
  saveSalonProfile: (profile: SalonProfile) => void;
  staff: Staff[];
  updateStaffStatus: (id: string, status: StaffStatus) => void;
  inventory: InventoryItem[];
  adjustStock: (id: string, delta: number) => void;
  sales: Sale[];
  completeSale: (input: NewSaleInput) => Sale;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SalonDataContext = createContext<SalonDataContextValue | undefined>(undefined);

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function parsePrice(price: string) {
  return Number(price.replace(/[^0-9]/g, "")) || 0;
}

export function SalonDataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(() => loadOrSeed(BOOKINGS_KEY, seedBookings));
  const [clients, setClients] = useState<Client[]>(() => loadOrSeed(CLIENTS_KEY, seedClients));
  const [staffList, setStaffList] = useState<Staff[]>(() => loadOrSeed(STAFF_KEY, seedStaff));
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>(() =>
    loadOrSeed(INVENTORY_KEY, seedInventory)
  );
  const [sales, setSales] = useState<Sale[]>(() => loadOrSeed(SALES_KEY, []));
  // null (not the demo default) until an owner actually completes onboarding —
  // this is what lets the app tell "already set up" apart from "brand new tenant".
  const [salonProfile, setSalonProfile] = useState<SalonProfile | null>(() => loadProfile());

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STAFF_KEY, JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventoryList));
  }, [inventoryList]);

  useEffect(() => {
    localStorage.setItem(SALES_KEY, JSON.stringify(sales));
  }, [sales]);

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
    setInventoryList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
  }, []);

  const addBooking = useCallback(
    (input: NewBookingInput): Booking => {
      const selectedServices = allServices.filter((s) => input.serviceIds.includes(s.id));
      const totalPrice = selectedServices.reduce((sum, s) => sum + parsePrice(s.price), 0);

      let clientId = input.clientId ?? "";
      let clientName = "";

      setClients((prev) => {
        if (input.clientId) {
          // Existing client — bump their visit stats.
          return prev.map((c) =>
            c.id === input.clientId
              ? {
                  ...c,
                  visits: c.visits + 1,
                  lastVisit: input.date,
                  totalSpend: formatINR(parsePrice(c.totalSpend) + totalPrice),
                }
              : c
          );
        }

        if (input.newClient) {
          const newId = `cl-${Date.now()}`;
          clientId = newId;
          clientName = input.newClient.name;
          const newClient: Client = {
            id: newId,
            name: input.newClient.name,
            email: input.newClient.email,
            phone: input.newClient.phone,
            visits: 1,
            lastVisit: input.date,
            totalSpend: formatINR(totalPrice),
            favoriteService: selectedServices[0]?.name ?? "—",
            status: "Active",
          };
          return [newClient, ...prev];
        }

        return prev;
      });

      if (!clientName) {
        clientName = clients.find((c) => c.id === input.clientId)?.name ?? "Unknown client";
      }

      const booking: Booking = {
        id: `bk-${Date.now()}`,
        clientId,
        client: clientName,
        services: selectedServices.map((s) => s.name),
        stylist: input.stylist,
        date: input.date,
        time: input.time,
        price: formatINR(totalPrice),
        status: input.status,
      };

      setBookings((prev) => [booking, ...prev]);
      return booking;
    },
    [clients]
  );

  const completeSale = useCallback((input: NewSaleInput): Sale => {
    const sale: Sale = {
      id: `sl-${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
    };

    setSales((prev) => [sale, ...prev]);

    // Decrement stock for any product lines sold.
    setInventoryList((prev) =>
      prev.map((item) => {
        const line = input.lines.find((l) => l.kind === "product" && l.refId === item.id);
        return line ? { ...item, quantity: Math.max(0, item.quantity - line.qty) } : item;
      })
    );

    // Bump the assigned client's stats, same as a booking would.
    if (input.customerId) {
      setClients((prev) =>
        prev.map((c) =>
          c.id === input.customerId
            ? {
                ...c,
                visits: c.visits + 1,
                lastVisit: sale.createdAt.slice(0, 10),
                totalSpend: formatINR(parsePrice(c.totalSpend) + input.total),
              }
            : c
        )
      );
    }

    return sale;
  }, []);

  const value = useMemo<SalonDataContextValue>(
    () => ({
      bookings,
      clients,
      addBooking,
      salonProfile,
      isOnboarded: Boolean(salonProfile),
      saveSalonProfile,
      staff: staffList,
      updateStaffStatus,
      inventory: inventoryList,
      adjustStock,
      sales,
      completeSale,
    }),
    [
      bookings,
      clients,
      addBooking,
      salonProfile,
      saveSalonProfile,
      staffList,
      updateStaffStatus,
      inventoryList,
      adjustStock,
      sales,
      completeSale,
    ]
  );

  return <SalonDataContext.Provider value={value}>{children}</SalonDataContext.Provider>;
}
