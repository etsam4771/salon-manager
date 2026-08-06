import { useMemo, useState } from "react";
import { HiOutlineArrowLeft, HiOutlineCheck } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import SearchInput from "../../components/admin/SearchInput";
import Button from "../../components/ui/Button";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import { categoryNames, services } from "../../data/services";
import { stylists } from "../../data/stylists";
import type { AppointmentStatus } from "../../types/salon";
import { appointmentStatusLabel, formatCurrency } from "../../utils/format";

type ClientMode = "existing" | "new";

const BOOKABLE_STATUSES: AppointmentStatus[] = ["confirmed", "pending"];

export default function AdminNewBookingPage() {
  const { customers, addAppointment } = useSalonData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [clientMode, setClientMode] = useState<ClientMode>("existing");
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [stylist, setStylist] = useState(stylists[0]);
  const [date, setDate] = useState("2026-08-05");
  const [time, setTime] = useState("10:00");
  const [status, setStatus] = useState<AppointmentStatus>("confirmed");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredClients = useMemo(
    () =>
      customers.filter(
        (c) =>
          clientQuery.trim() === "" || c.fullName.toLowerCase().includes(clientQuery.toLowerCase())
      ),
    [customers, clientQuery]
  );

  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [selectedServiceIds]
  );

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMins, 0);

  const selectedClient = customers.find((c) => c.id === selectedClientId) ?? null;

  function toggleService(id: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (clientMode === "existing" && !selectedClientId) {
      setError("Choose a client, or switch to “New client” to add one.");
      return;
    }
    if (clientMode === "new" && (!newClientName.trim() || !newClientPhone.trim())) {
      setError("New clients need at least a name and phone number.");
      return;
    }
    if (selectedServiceIds.length === 0) {
      setError("Select at least one service.");
      return;
    }
    if (!date || !time) {
      setError("Pick a date and time for the appointment.");
      return;
    }

    setSubmitting(true);
    addAppointment({
      customerId: clientMode === "existing" ? selectedClientId ?? undefined : undefined,
      newCustomer:
        clientMode === "new"
          ? { name: newClientName.trim(), email: newClientEmail.trim(), phone: newClientPhone.trim() }
          : undefined,
      serviceIds: selectedServiceIds,
      stylist,
      date,
      time,
      status,
    });

    navigate("/admin/bookings");
    showToast("Booking created.", "success");
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-forest mb-3"
        >
          <HiOutlineArrowLeft size={14} /> Back to bookings
        </Link>
        <AdminPageHeader title="New booking" subtitle="Add a client and the services for this appointment" />
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Client */}
          <section className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-ink">Client</h2>
              <div className="flex gap-2">
                {(["existing", "new"] as ClientMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setClientMode(mode)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      clientMode === mode
                        ? "bg-forest text-sand-light border-forest"
                        : "border-blush text-ink/60 hover:border-forest/40"
                    }`}
                  >
                    {mode === "existing" ? "Existing client" : "New client"}
                  </button>
                ))}
              </div>
            </div>

            {clientMode === "existing" ? (
              <div className="flex flex-col gap-4">
                <SearchInput
                  value={clientQuery}
                  onChange={setClientQuery}
                  placeholder="Search clients by name…"
                />
                <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 -mx-2 px-2">
                  {filteredClients.map((c) => (
                    <label
                      key={c.id}
                      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                        selectedClientId === c.id
                          ? "border-forest bg-forest/5"
                          : "border-transparent hover:bg-sand"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="client"
                          className="accent-forest"
                          checked={selectedClientId === c.id}
                          onChange={() => setSelectedClientId(c.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-ink">{c.fullName}</p>
                          <p className="text-xs text-ink/50">{c.email ?? c.phone}</p>
                        </div>
                      </div>
                      <span className="text-xs text-ink/50 font-mono">{c.visits} visits</span>
                    </label>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-sm text-ink/50 py-4 text-center">No clients match.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="newClientName" className="text-sm text-ink/70">
                    Full name
                  </label>
                  <input
                    id="newClientName"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Jane Doe"
                    className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="newClientPhone" className="text-sm text-ink/70">
                    Phone
                  </label>
                  <input
                    id="newClientPhone"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+91 98xxx xxxxx"
                    className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="newClientEmail" className="text-sm text-ink/70">
                    Email <span className="text-ink/40">(optional)</span>
                  </label>
                  <input
                    id="newClientEmail"
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Services */}
          <section className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink mb-5">Services</h2>
            <div className="flex flex-col gap-6">
              {categoryNames
                .filter((c) => c !== "All")
                .map((category) => (
                  <div key={category}>
                    <p className="text-[11px] font-mono uppercase tracking-wide text-gold mb-2.5">
                      {category}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {services
                        .filter((s) => s.categoryName === category)
                        .map((s) => (
                          <label
                            key={s.id}
                            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                              selectedServiceIds.includes(s.id)
                                ? "border-forest bg-forest/5"
                                : "border-transparent hover:bg-sand"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="accent-forest"
                                checked={selectedServiceIds.includes(s.id)}
                                onChange={() => toggleService(s.id)}
                              />
                              <div>
                                <p className="text-sm font-medium text-ink">{s.name}</p>
                                <p className="text-xs text-ink/50 font-mono">{s.durationMins} min</p>
                              </div>
                            </div>
                            <span className="text-sm text-ink/70">{formatCurrency(s.price)}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Appointment details */}
          <section className="bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8">
            <h2 className="font-display text-xl text-ink mb-5">Appointment</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="stylist" className="text-sm text-ink/70">
                  Stylist
                </label>
                <select
                  id="stylist"
                  value={stylist}
                  onChange={(e) => setStylist(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors bg-white"
                >
                  {stylists.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="text-sm text-ink/70">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors bg-white"
                >
                  {BOOKABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {appointmentStatusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="date" className="text-sm text-ink/70">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                />
              </div>
              <div>
                <label htmlFor="time" className="text-sm text-ink/70">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-6 bg-forest text-sand-light rounded-2xl p-6 md:p-8 flex flex-col gap-6">
          <h2 className="font-display text-xl">Summary</h2>

          <div>
            <p className="text-xs uppercase tracking-wide text-sand-light/60 font-mono mb-1">Client</p>
            <p className="text-sm">
              {clientMode === "existing"
                ? selectedClient?.fullName ?? "No client selected"
                : newClientName.trim() || "New client"}
            </p>
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-sand-light/60 font-mono mb-2">
              Services ({selectedServices.length})
            </p>
            {selectedServices.length === 0 ? (
              <p className="text-sm text-sand-light/60">No services selected yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {selectedServices.map((s) => (
                  <li key={s.id} className="flex justify-between text-sm gap-3">
                    <span>{s.name}</span>
                    <span className="text-gold-light font-mono shrink-0">{formatCurrency(s.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-sand-light/15 pt-4 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-sand-light/70">
              <span>Duration</span>
              <span className="font-mono">{totalDuration} min</span>
            </div>
            <div className="flex justify-between text-lg font-display">
              <span>Total</span>
              <span className="text-gold-light">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm bg-red-500/15 text-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full gap-1.5 !bg-gold !text-ink hover:!bg-gold-light" disabled={submitting}>
            <HiOutlineCheck /> {submitting ? "Booking…" : "Confirm booking"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
