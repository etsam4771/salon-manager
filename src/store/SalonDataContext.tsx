import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { bookings as seedBookings, type Booking, type BookingStatus } from "../data/bookings";
import { clients as seedClients, type Client } from "../data/clients";
import { services as allServices } from "../data/services";

const BOOKINGS_KEY = "salon:bookings";
const CLIENTS_KEY = "salon:clients";

function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // fall through to seed data
  }
  return seed;
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

interface SalonDataContextValue {
  bookings: Booking[];
  clients: Client[];
  addBooking: (input: NewBookingInput) => Booking;
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

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  }, [clients]);

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

  const value = useMemo<SalonDataContextValue>(
    () => ({ bookings, clients, addBooking }),
    [bookings, clients, addBooking]
  );

  return <SalonDataContext.Provider value={value}>{children}</SalonDataContext.Provider>;
}
