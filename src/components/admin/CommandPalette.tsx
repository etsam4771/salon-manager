import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useSalonData } from "../../hooks/useSalonData";
import { services } from "../../data/services";
import { staff } from "../../data/staff";
import { appointmentStatusLabel, formatCurrency, formatDate, formatTime } from "../../utils/format";

interface Result {
  id: string;
  group: "Clients" | "Bookings" | "Services" | "Staff";
  label: string;
  sublabel: string;
  path: string;
  icon: typeof HiOutlineUser;
}

interface CommandPaletteProps {
  onClose: () => void;
}

export default function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { customers, appointments } = useSalonData();

  useEffect(() => {
    // Focus once this mounts (the parent only renders us while open).
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const clientResults: Result[] = customers
      .filter((c) => c.fullName.toLowerCase().includes(q) || (c.email ?? "").toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        group: "Clients",
        label: c.fullName,
        sublabel: c.email ?? c.phone,
        path: "/admin/clients",
        icon: HiOutlineUser,
      }));

    const bookingResults: Result[] = appointments
      .filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.serviceName.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((a) => ({
        id: a.id,
        group: "Bookings",
        label: `${a.customerName} · ${a.serviceName}`,
        sublabel: `${formatDate(a.startTime)} · ${formatTime(a.startTime)} · ${appointmentStatusLabel(a.status)}`,
        path: "/admin/bookings",
        icon: HiOutlineCalendar,
      }));

    const serviceResults: Result[] = services
      .filter((s) => s.name.toLowerCase().includes(q) || s.categoryName.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        group: "Services",
        label: s.name,
        sublabel: `${s.categoryName} · ${formatCurrency(s.price)}`,
        path: "/admin/services",
        icon: HiOutlineSparkles,
      }));

    const staffResults: Result[] = staff
      .filter((s) => s.fullName.toLowerCase().includes(q) || s.designation.toLowerCase().includes(q))
      .slice(0, 4)
      .map((s) => ({
        id: s.id,
        group: "Staff",
        label: s.fullName,
        sublabel: s.designation,
        path: "/admin/staff",
        icon: HiOutlineUserGroup,
      }));

    return [...clientResults, ...bookingResults, ...serviceResults, ...staffResults];
  }, [query, customers, appointments]);

  function go(result: Result) {
    navigate(result.path);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      go(results[activeIndex]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] bg-ink/40 flex items-start justify-center pt-24 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-blush/60">
          <HiOutlineSearch className="text-ink/40 shrink-0" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search clients, bookings, services, staff…"
            className="flex-1 outline-none text-sm placeholder:text-ink/40"
          />
          <kbd className="text-[10px] font-mono text-ink/40 border border-blush rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {query.trim() === "" && (
            <p className="px-4 py-6 text-sm text-ink/40 text-center">
              Start typing to search across the salon.
            </p>
          )}
          {query.trim() !== "" && results.length === 0 && (
            <p className="px-4 py-6 text-sm text-ink/40 text-center">No matches for "{query}".</p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.group}-${r.id}`}
              onClick={() => go(r)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === activeIndex ? "bg-sand" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <r.icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{r.label}</p>
                <p className="text-xs text-ink/50 truncate">
                  {r.group} · {r.sublabel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
