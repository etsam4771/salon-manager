import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { useSalonData } from "../hooks/useSalonData";
import { themeMeta, type SalonProfile, type SalonTheme } from "../types/salon";
import type { ApiError } from "../utils/response";

const CATEGORIES = ["Unisex Salon & Spa", "Hair Salon", "Nail Studio", "Spa & Wellness", "Beauty Parlour"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STEPS = ["Salon details", "Branding", "Hours", "Owner account"] as const;

interface FormState {
  name: string;
  category: string;
  phone: string;
  address: string;
  city: string;
  theme: SalonTheme;
  openTime: string;
  closeTime: string;
  workingDays: string[];
  ownerName: string;
  ownerEmail: string;
  password: string;
}

const initialForm: FormState = {
  name: "",
  category: CATEGORIES[0],
  phone: "",
  address: "",
  city: "",
  theme: "modern",
  openTime: "09:00",
  closeTime: "20:00",
  workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ownerName: "",
  ownerEmail: "",
  password: "",
};

function inputClass() {
  return "mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50";
}

export default function OnboardSalonPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const { saveSalonProfile } = useSalonData();
  const navigate = useNavigate();

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(day: string) {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  }

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!form.name.trim()) return "Give your salon a name.";
      if (!form.phone.trim()) return "Add a contact phone number.";
      if (!form.city.trim()) return "Tell us which city you're in.";
    }
    if (step === 2) {
      if (form.workingDays.length === 0) return "Pick at least one working day.";
    }
    if (step === 3) {
      if (!form.ownerName.trim()) return "Add the owner's full name.";
      if (!form.ownerEmail.trim()) return "Add the owner's email.";
      if (form.password.length < 8) return "Password needs to be at least 8 characters.";
    }
    return null;
  }, [step, form]);

  function goNext() {
    if (stepError) {
      setErrorMessage(stepError);
      return;
    }
    setErrorMessage(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrorMessage(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    if (stepError) {
      setErrorMessage(stepError);
      return;
    }
    setErrorMessage(null);
    setLoading(true);

    try {
      await register({
        name: form.ownerName,
        email: form.ownerEmail,
        password: form.password,
        role: "admin",
      });

      const profile: SalonProfile = {
        name: form.name,
        category: form.category,
        phone: form.phone,
        email: form.ownerEmail,
        address: form.address,
        city: form.city,
        theme: form.theme,
        openTime: form.openTime,
        closeTime: form.closeTime,
        workingDays: form.workingDays,
        onboarded: true,
      };
      saveSalonProfile(profile);

      navigate("/admin");
    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err) && err.response?.data) {
        setErrorMessage(err.response.data.message || "Couldn't create your salon. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand-light">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex mb-8">
          <Logo />
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-forest text-sand-light flex items-center justify-center shrink-0">
            <HiOutlineOfficeBuilding size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-ink">Onboard your salon</h1>
            <p className="text-sm text-ink/60">Set up your business in a few quick steps.</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mt-8 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border transition-colors ${
                    i < step
                      ? "bg-forest border-forest text-sand-light"
                      : i === step
                      ? "border-forest text-forest bg-white"
                      : "border-blush text-ink/40 bg-white"
                  }`}
                >
                  {i < step ? <HiOutlineCheck size={14} /> : i + 1}
                </div>
                <span className={`text-[11px] text-center whitespace-nowrap ${i === step ? "text-ink" : "text-ink/40"}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-2 ${i < step ? "bg-forest" : "bg-blush"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-blush/60 p-6 md:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Step 1 — Salon details */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="text-sm text-ink/70">
                  Salon name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Glow & Co."
                  className={inputClass()}
                />
              </div>
              <div>
                <label htmlFor="category" className="text-sm text-ink/70">
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className={`${inputClass()} bg-white`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="text-sm text-ink/70">
                    Phone
                  </label>
                  <input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+91 98xxx xxxxx"
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="text-sm text-ink/70">
                    City
                  </label>
                  <input
                    id="city"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Bengaluru"
                    className={inputClass()}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="text-sm text-ink/70">
                  Address <span className="text-ink/40">(optional)</span>
                </label>
                <input
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="12 MG Road, Indiranagar"
                  className={inputClass()}
                />
              </div>
            </div>
          )}

          {/* Step 2 — Branding */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink/60">
                Pick a starting look for your booking site and dashboard. You can fine-tune this later
                in Settings.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {(Object.keys(themeMeta) as SalonTheme[]).map((key) => {
                  const meta = themeMeta[key];
                  const active = form.theme === key;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => update("theme", key)}
                      className={`text-left rounded-xl border p-4 transition-colors ${
                        active ? "border-forest bg-forest/5" : "border-blush hover:border-forest/40"
                      }`}
                    >
                      <div className="flex gap-1.5 mb-3">
                        {meta.swatches.map((c) => (
                          <span
                            key={c}
                            className="w-6 h-6 rounded-full border border-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                        {meta.label}
                        {active && <HiOutlineCheck className="text-forest" size={14} />}
                      </p>
                      <p className="text-xs text-ink/50 mt-1">{meta.blurb}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Hours */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="openTime" className="text-sm text-ink/70">
                    Opens at
                  </label>
                  <input
                    id="openTime"
                    type="time"
                    value={form.openTime}
                    onChange={(e) => update("openTime", e.target.value)}
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label htmlFor="closeTime" className="text-sm text-ink/70">
                    Closes at
                  </label>
                  <input
                    id="closeTime"
                    type="time"
                    value={form.closeTime}
                    onChange={(e) => update("closeTime", e.target.value)}
                    className={inputClass()}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm text-ink/70 mb-2.5">Working days</p>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.workingDays.includes(day)
                          ? "bg-forest text-sand-light border-forest"
                          : "border-blush text-ink/60 hover:border-forest/40"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Owner account */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink/60">
                This becomes the admin account for {form.name || "your salon"}.
              </p>
              <div>
                <label htmlFor="ownerName" className="text-sm text-ink/70">
                  Your full name
                </label>
                <input
                  id="ownerName"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  placeholder="Ananya Verma"
                  className={inputClass()}
                />
              </div>
              <div>
                <label htmlFor="ownerEmail" className="text-sm text-ink/70">
                  Email
                </label>
                <input
                  id="ownerEmail"
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => update("ownerEmail", e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass()}
                />
              </div>
              <div>
                <label htmlFor="password" className="text-sm text-ink/70">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass()}
                />
              </div>

              {/* Review summary */}
              <div className="rounded-xl bg-sand p-4 text-sm text-ink/70 flex flex-col gap-1 mt-2">
                <p className="text-ink font-medium mb-1">Review</p>
                <p>
                  {form.name || "—"} · {form.category}
                </p>
                <p>
                  {form.city || "—"} · {themeMeta[form.theme].label} theme
                </p>
                <p>
                  Open {form.openTime}–{form.closeTime}, {form.workingDays.length} days/week
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-blush/40">
            {step > 0 ? (
              <Button variant="secondary" type="button" onClick={goBack} disabled={loading} className="gap-1.5">
                <HiOutlineArrowLeft size={14} /> Back
              </Button>
            ) : (
              <span />
            )}

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} className="gap-1.5">
                Next <HiOutlineArrowRight size={14} />
              </Button>
            ) : (
              <Button type="button" onClick={handleFinish} disabled={loading} className="gap-1.5">
                {loading ? "Setting up…" : "Complete setup"}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-ink/60">
          Already onboarded?{" "}
          <Link to="/login" className="text-forest font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
