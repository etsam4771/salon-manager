import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineStar,
} from "react-icons/hi";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { services, categoryNames } from "../data/services";
import { stylists } from "../data/stylists";
import { useSalonData } from "../hooks/useSalonData";
import { defaultSalonProfile } from "../types/salon";
import { formatCurrency } from "../utils/format";

function nextDays(count: number) {
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
}

// 24-hour "HH:MM" slots — matches the time format Appointment.startTime is built from.
function timeSlots(openTime: string, closeTime: string) {
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const slots: string[] = [];
  let mins = openH * 60 + openM;
  const end = closeH * 60 + closeM;
  while (mins < end) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    mins += 30;
  }
  return slots;
}

function formatSlot(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

// Deterministic "already booked" pattern so the grid feels real without a backend.
function isSlotTaken(dateKey: string, slot: string) {
  let hash = 0;
  const str = dateKey + slot;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 997;
  return hash % 4 === 0;
}

function downloadIcs(opts: { title: string; date: string; time: string; durationMin: number }) {
  const [h, m] = opts.time.split(":").map(Number);
  const start = new Date(opts.date);
  start.setHours(h, m, 0, 0);
  const end = new Date(start.getTime() + opts.durationMin * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "appointment.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export default function BookingFlowPage() {
  const { salonProfile, addAppointment, appointments } = useSalonData();
  const profile = salonProfile ?? defaultSalonProfile;

  const [step, setStep] = useState(0);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [anyStylist, setAnyStylist] = useState(true);
  const [stylist, setStylist] = useState(stylists[0]);
  const [selectedDate, setSelectedDate] = useState(() => nextDays(1)[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verified, setVerified] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const days = useMemo(() => nextDays(7), []);
  const slots = useMemo(() => timeSlots(profile.openTime, profile.closeTime), [profile]);
  const dateKey = selectedDate.toISOString().slice(0, 10);

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.durationMins, 0);

  function toggleService(id: string) {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function sendOtp() {
    setOtpSent(true);
  }

  function verifyOtp() {
    if (otp.every((d) => d.length === 1)) {
      setVerified(true);
    }
  }

  function confirmBooking() {
    if (!selectedTime) return;
    const appointment = addAppointment({
      newCustomer: { name, email: "", phone },
      serviceIds: selectedServiceIds,
      stylist: anyStylist ? stylists[appointments.length % stylists.length] : stylist,
      date: dateKey,
      time: selectedTime,
      status: "pending",
    });
    setConfirmedBookingId(appointment.id);
  }

  const stepValid = () => {
    if (step === 1) return selectedServiceIds.length > 0;
    if (step === 2) return Boolean(selectedTime);
    return true;
  };

  // ---- Success screen ----
  if (confirmedBookingId) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl border border-blush/60 p-8 text-center flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-forest/10 text-forest flex items-center justify-center">
            <HiOutlineCheck size={26} />
          </div>
          <h1 className="font-display text-2xl text-ink">You're booked!</h1>
          <p className="text-sm text-ink/60">
            {selectedServices.map((s) => s.name).join(", ")} on {dateKey} at {formatSlot(selectedTime!)}.
          </p>
          <p className="text-xs text-ink/40 font-mono">Booking ID {confirmedBookingId}</p>

          <div className="flex flex-col gap-2 w-full mt-2">
            <Button
              variant="secondary"
              className="w-full gap-1.5"
              onClick={() =>
                downloadIcs({
                  title: `${profile.name} — ${selectedServices.map((s) => s.name).join(", ")}`,
                  date: dateKey,
                  time: selectedTime!,
                  durationMin: totalDuration || 60,
                })
              }
            >
              <HiOutlineCalendar size={16} /> Add to calendar
            </Button>
            <Link to="/">
              <Button className="w-full">Back to home</Button>
            </Link>
          </div>

          {whatsappOptIn && (
            <p className="text-xs text-ink/40">We'll send your confirmation over WhatsApp too.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-light">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex mb-6">
          <Logo />
        </Link>

        {/* Step 0 — Landing */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl overflow-hidden bg-forest text-sand-light p-8">
              <p className="text-xs uppercase tracking-wide text-gold-light font-mono mb-2">
                {profile.category}
              </p>
              <h1 className="font-display text-3xl mb-3">{profile.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-sand-light/80 mb-1">
                <HiOutlineLocationMarker size={15} className="shrink-0" />
                {profile.city ? `${profile.address ? profile.address + ", " : ""}${profile.city}` : "Location available on request"}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-sand-light/80">
                <HiOutlineStar size={15} className="text-gold-light shrink-0" />
                4.8 · 312 Google reviews
              </div>
            </div>
            <p className="text-sm text-ink/60 text-center">
              Book your appointment in under a minute — pick services, a time, and you're set.
            </p>
            <Button size="lg" onClick={() => setStep(1)} className="w-full">
              Start booking
            </Button>
          </div>
        )}

        {/* Step 1 — Select services */}
        {step === 1 && (
          <div className="flex flex-col gap-5 pb-24">
            <h1 className="font-display text-2xl text-ink">Select services</h1>
            {categoryNames
              .filter((c) => c !== "All")
              .map((cat) => (
                <div key={cat}>
                  <p className="text-[11px] font-mono uppercase tracking-wide text-gold mb-2">{cat}</p>
                  <div className="flex flex-col gap-1.5">
                    {services
                      .filter((s) => s.categoryName === cat)
                      .map((s) => (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 cursor-pointer border transition-colors ${
                            selectedServiceIds.includes(s.id)
                              ? "border-forest bg-forest/5"
                              : "border-blush/60 bg-white hover:border-forest/30"
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
                          <span className="text-sm text-ink/70 shrink-0">{formatCurrency(s.price)}</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Step 2 — Stylist & time */}
        {step === 2 && (
          <div className="flex flex-col gap-6 pb-24">
            <h1 className="font-display text-2xl text-ink">Pick a time</h1>

            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={anyStylist}
                onChange={(e) => setAnyStylist(e.target.checked)}
                className="accent-forest"
              />
              Any available stylist
            </label>

            {!anyStylist && (
              <div className="flex flex-wrap gap-2">
                {stylists.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStylist(s)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      stylist === s
                        ? "bg-forest text-sand-light border-forest"
                        : "border-blush text-ink/60 hover:border-forest/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {days.map((d) => {
                const key = d.toISOString().slice(0, 10);
                const active = key === dateKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedTime(null);
                    }}
                    className={`flex flex-col items-center justify-center shrink-0 w-14 h-16 rounded-xl border transition-colors ${
                      active ? "bg-forest text-sand-light border-forest" : "border-blush bg-white text-ink/70"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="font-display text-lg">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const taken = isSlotTaken(dateKey, slot);
                return (
                  <button
                    key={slot}
                    disabled={taken}
                    onClick={() => setSelectedTime(slot)}
                    className={`rounded-lg py-2.5 text-xs font-mono border transition-colors ${
                      taken
                        ? "border-blush/40 text-ink/25 line-through cursor-not-allowed"
                        : selectedTime === slot
                        ? "bg-forest text-sand-light border-forest"
                        : "border-blush bg-white text-ink/70 hover:border-forest/40"
                    }`}
                  >
                    {formatSlot(slot)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation & OTP */}
        {step === 3 && (
          <div className="flex flex-col gap-5 pb-24">
            <h1 className="font-display text-2xl text-ink">Confirm your details</h1>

            <div className="rounded-xl bg-white border border-blush/60 p-4 text-sm text-ink/70 flex flex-col gap-1">
              <p className="text-ink font-medium">{selectedServices.map((s) => s.name).join(", ")}</p>
              <p>
                {dateKey} · {formatSlot(selectedTime!)} · {anyStylist ? "Any available stylist" : stylist}
              </p>
              <p className="font-display text-lg text-forest mt-1">{formatCurrency(total)}</p>
            </div>

            <div>
              <label className="text-sm text-ink/70">Full name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-ink/70">Phone number</label>
              <div className="mt-2 flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98xxx xxxxx"
                  disabled={otpSent}
                  className="flex-1 rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-60"
                />
                {!otpSent && (
                  <Button variant="secondary" size="md" onClick={sendOtp} disabled={!phone.trim()}>
                    Send OTP
                  </Button>
                )}
              </div>
            </div>

            {otpSent && !verified && (
              <div>
                <label className="text-sm text-ink/70">Enter the 4-digit code</label>
                <div className="mt-2 flex gap-2">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      value={digit}
                      maxLength={1}
                      inputMode="numeric"
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, "");
                        setOtp((prev) => prev.map((d, idx) => (idx === i ? v : d)));
                      }}
                      className="w-12 h-12 text-center rounded-lg border border-blush text-lg outline-none focus:border-forest transition-colors"
                    />
                  ))}
                  <Button size="md" onClick={verifyOtp}>
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {verified && (
              <>
                <p className="text-sm text-forest flex items-center gap-1.5">
                  <HiOutlineCheck size={16} /> Phone verified
                </p>
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="accent-forest"
                  />
                  Send my confirmation over WhatsApp
                </label>
              </>
            )}
          </div>
        )}

        {/* Nav */}
        {step > 0 && !confirmedBookingId && (
          <div className="fixed bottom-0 left-0 right-0 bg-sand-light/95 backdrop-blur-sm border-t border-blush/60 px-4 py-4">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center gap-1.5 text-sm text-ink/60 hover:text-forest"
              >
                <HiOutlineArrowLeft size={14} /> Back
              </button>
              {step < 3 && (
                <div className="flex items-center gap-3 ml-auto">
                  {step === 1 && selectedServices.length > 0 && (
                    <span className="text-sm text-ink/60">{formatCurrency(total)}</span>
                  )}
                  <Button onClick={() => setStep((s) => s + 1)} disabled={!stepValid()} className="gap-1.5">
                    Continue <HiOutlineArrowRight size={14} />
                  </Button>
                </div>
              )}
              {step === 3 && (
                <Button onClick={confirmBooking} disabled={!verified} className="gap-1.5 ml-auto">
                  <HiOutlineCheck size={15} /> Confirm booking
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
