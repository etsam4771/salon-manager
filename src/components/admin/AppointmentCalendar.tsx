import { useMemo, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import type { Appointment, AppointmentStatus } from "../../types/salon";
import { appointmentStatusLabel, formatCurrency, formatDate, formatTime } from "../../utils/format";

type CalendarView = "Day" | "Week" | "Month";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onReschedule: (id: string, newDate: string) => void;
}

// Distinct, high-contrast status colors for the calendar specifically —
// separate from the brand-toned StatusPill used elsewhere, since a
// scheduling grid needs colors that read at a glance.
const dotColor: Record<AppointmentStatus, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-500",
  in_progress: "bg-purple-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
  no_show: "bg-rose-700",
};

function dateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setDate(copy.getDate() - day);
  return copy;
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function AppointmentCalendar({ appointments, onReschedule }: AppointmentCalendarProps) {
  const [view, setView] = useState<CalendarView>("Week");
  const [anchor, setAnchor] = useState(() => new Date("2026-08-05"));
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const day = formatDate(a.startTime);
      const list = map.get(day) ?? [];
      list.push(a);
      map.set(day, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => timeToMinutes(formatTime(a.startTime)) - timeToMinutes(formatTime(b.startTime)));
    }
    return map;
  }, [appointments]);

  function shift(amount: number) {
    if (view === "Day") setAnchor((d) => addDays(d, amount));
    else if (view === "Week") setAnchor((d) => addDays(d, amount * 7));
    else setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + amount, 1));
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDrop(e: React.DragEvent, key: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id) onReschedule(id, key);
    setDragOverKey(null);
  }

  const label =
    view === "Month"
      ? anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })
      : view === "Week"
      ? `Week of ${startOfWeek(anchor).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : anchor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="bg-sand-light rounded-2xl border border-blush/60 p-5 md:p-6 flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shift(-1)}
            className="w-8 h-8 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
          >
            <HiOutlineChevronLeft size={14} />
          </button>
          <span className="font-display text-lg text-ink min-w-[180px] text-center">{label}</span>
          <button
            onClick={() => shift(1)}
            className="w-8 h-8 rounded-full border border-blush flex items-center justify-center text-ink/60 hover:border-forest"
          >
            <HiOutlineChevronRight size={14} />
          </button>
          <button
            onClick={() => setAnchor(new Date("2026-08-05"))}
            className="text-xs text-forest font-medium hover:underline ml-1"
          >
            Today
          </button>
        </div>
        <div className="flex gap-2">
          {(["Day", "Week", "Month"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                view === v
                  ? "bg-forest text-sand-light border-forest"
                  : "border-blush text-ink/60 hover:border-forest/40"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-ink/60">
        {(Object.keys(dotColor) as AppointmentStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${dotColor[s]}`} />
            {appointmentStatusLabel(s)}
          </span>
        ))}
      </div>

      {/* Month view */}
      {view === "Month" && (
        <MonthGrid
          anchor={anchor}
          byDate={byDate}
          dragOverKey={dragOverKey}
          setDragOverKey={setDragOverKey}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      )}

      {/* Week view */}
      {view === "Week" && (
        <WeekGrid
          anchor={anchor}
          byDate={byDate}
          dragOverKey={dragOverKey}
          setDragOverKey={setDragOverKey}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      )}

      {/* Day view */}
      {view === "Day" && <DayAgenda anchor={anchor} byDate={byDate} onDragStart={handleDragStart} />}
    </div>
  );
}

interface GridProps {
  anchor: Date;
  byDate: Map<string, Appointment[]>;
  dragOverKey: string | null;
  setDragOverKey: (key: string | null) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, key: string) => void;
}

function MonthGrid({ anchor, byDate, dragOverKey, setDragOverKey, onDragStart, onDrop }: GridProps) {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(firstOfMonth);
  const cells = Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i));

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="text-center text-[11px] font-mono uppercase tracking-wide text-ink/40 pb-1">
          {d}
        </div>
      ))}
      {cells.map((cellDate) => {
        const key = dateKey(cellDate);
        const inMonth = cellDate.getMonth() === anchor.getMonth();
        const dayAppointments = byDate.get(key) ?? [];
        return (
          <div
            key={key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverKey(key);
            }}
            onDragLeave={() => setDragOverKey(null)}
            onDrop={(e) => onDrop(e, key)}
            className={`min-h-[84px] rounded-lg border p-1.5 flex flex-col gap-1 transition-colors ${
              dragOverKey === key ? "border-forest bg-forest/5" : "border-blush/50 bg-white"
            } ${inMonth ? "" : "opacity-40"}`}
          >
            <span className="text-xs font-mono text-ink/50">{cellDate.getDate()}</span>
            {dayAppointments.slice(0, 3).map((a) => (
              <div
                key={a.id}
                draggable
                onDragStart={(e) => onDragStart(e, a.id)}
                className={`text-[10px] text-white rounded px-1.5 py-0.5 truncate cursor-grab ${dotColor[a.status]}`}
                title={`${a.customerName} · ${formatTime(a.startTime)}`}
              >
                {a.customerName}
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <span className="text-[10px] text-ink/40">+{dayAppointments.length - 3} more</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({ anchor, byDate, dragOverKey, setDragOverKey, onDragStart, onDrop }: GridProps) {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const key = dateKey(d);
        const dayAppointments = byDate.get(key) ?? [];
        return (
          <div
            key={key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverKey(key);
            }}
            onDragLeave={() => setDragOverKey(null)}
            onDrop={(e) => onDrop(e, key)}
            className={`rounded-lg border p-2 min-h-[220px] flex flex-col gap-1.5 transition-colors ${
              dragOverKey === key ? "border-forest bg-forest/5" : "border-blush/50 bg-white"
            }`}
          >
            <div className="text-center pb-1.5 border-b border-blush/40">
              <p className="text-[10px] font-mono uppercase text-ink/40">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="font-display text-sm text-ink">{d.getDate()}</p>
            </div>
            {dayAppointments.map((a) => (
              <div
                key={a.id}
                draggable
                onDragStart={(e) => onDragStart(e, a.id)}
                className="rounded-md border-l-4 bg-sand px-2 py-1.5 cursor-grab"
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[a.status]}`} />
                  <span className="text-[10px] font-mono text-ink/50">{formatTime(a.startTime)}</span>
                </div>
                <p className="text-xs text-ink font-medium truncate mt-0.5">{a.customerName}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function DayAgenda({
  anchor,
  byDate,
  onDragStart,
}: Pick<GridProps, "anchor" | "byDate" | "onDragStart">) {
  const key = dateKey(anchor);
  const dayAppointments = byDate.get(key) ?? [];

  if (dayAppointments.length === 0) {
    return <p className="text-center text-sm text-ink/40 py-12">No appointments on this day.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {dayAppointments.map((a) => (
        <div
          key={a.id}
          draggable
          onDragStart={(e) => onDragStart(e, a.id)}
          className="flex items-center gap-4 rounded-xl bg-white border-l-4 border border-blush/40 px-4 py-3 cursor-grab"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[a.status]}`} />
          <span className="text-sm font-mono text-ink/60 w-20 shrink-0">{formatTime(a.startTime)}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink truncate">{a.customerName}</p>
            <p className="text-xs text-ink/50 truncate">{a.serviceName}</p>
          </div>
          <span className="text-xs text-ink/50 shrink-0">{a.staffName ?? "Unassigned"}</span>
          <span className="text-sm text-ink/70 shrink-0">{formatCurrency(a.finalPrice)}</span>
        </div>
      ))}
    </div>
  );
}
