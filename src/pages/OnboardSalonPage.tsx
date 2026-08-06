import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineX,
} from "react-icons/hi";
import Logo from "../components/ui/Logo";
import Button from "../components/ui/Button";
import type { ApiError } from "../utils/response";
import type { BranchTiming, BusinessModel } from "../types/gloable.types";
import { gloabalApiService } from "../api/services/gloable.api.service";

export interface OnboardRequestBody {
  companyName: string;
  businessModel: string[];
  subType: string[];
  domainType: "self" | "default";
  domainName: string;
  timeZone: string;
  currency: string;
  haveGST: boolean;
  GST?: string;
  branchName: string;
  branchCode: string;
  addressLine: string;
  region: string;
  country: string;
  weekday: string;
  workingTime: BranchTiming[];
  fullName: string;
  username: string;
  email: string;
  phone: string;
  avatar?: File | string;
  logo?: File | string;
}

const STEPS = [
  "Business identity",
  "Domain & region",
  "Branch details",
  "Hours",
  "Owner account"
] as const;

// Default working days (Mon-Sat)
const DEFAULT_WORKING_DAYS: BranchTiming[] = [
  { day: "Mon", openAt: "09:00", closesAt: "20:00" },
  { day: "Tue", openAt: "09:00", closesAt: "20:00" },
  { day: "Wed", openAt: "09:00", closesAt: "20:00" },
  { day: "Thu", openAt: "09:00", closesAt: "20:00" },
  { day: "Fri", openAt: "09:00", closesAt: "20:00" },
  { day: "Sat", openAt: "09:00", closesAt: "20:00" },
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface FormState {
  // Business Identity
  companyName: string;
  businessModel: string[];
  subType: string[];

  // Domain Configuration
  domainType: "self" | "default";
  domainName: string;

  // Regional & Tax Settings
  timeZone: string;
  currency: string;
  haveGST: boolean;
  GST: string;

  // Branch Details
  branchName: string;
  branchCode: string;
  addressLine: string;
  region: string;
  country: string;

  // Operating Hours
  weekday: string;
  workingTime: BranchTiming[];

  // Primary User Profile
  fullName: string;
  username: string;
  email: string;
  phone: string;

  // Media
  avatar: File | null;
  logo: File | null;
}

const initialForm: FormState = {
  companyName: "",
  businessModel: [],
  subType: [],
  domainType: "default",
  domainName: "",
  timeZone: "Asia/Kolkata",
  currency: "INR",
  haveGST: false,
  GST: "",
  branchName: "",
  branchCode: "",
  addressLine: "",
  region: "",
  country: "India",
  weekday: "Mon-Sat",
  workingTime: DEFAULT_WORKING_DAYS,
  fullName: "",
  username: "",
  email: "",
  phone: "",
  avatar: null,
  logo: null,
};

function inputClass() {
  return "mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50";
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  companyName,
  email,
  onNavigate
}: {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  email: string;
  onNavigate: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-slideUp">
        <div className="flex justify-between items-start mb-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <button
            onClick={onClose}
            className="text-ink/40 hover:text-ink transition-colors -mt-2 -mr-2 p-2"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <h2 className="text-2xl font-display text-center text-ink mb-2">
          🎉 Onboarding Initiated!
        </h2>
        <p className="text-center text-ink/60 text-sm mb-6">
          Your business has been successfully set up.
        </p>

        <div className="bg-sand-light rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Company</span>
            <span className="text-ink font-medium">{companyName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Admin email</span>
            <span className="text-ink font-medium">{email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink/60">Status</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <HiOutlineCheck size={14} /> Active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onNavigate}
            className="w-full justify-center"
          >
            Go to Dashboard
          </Button>
          <button
            onClick={onClose}
            className="w-full text-sm text-ink/50 hover:text-ink transition-colors"
          >
            Stay on this page
          </button>
        </div>

        <p className="text-xs text-center text-ink/40 mt-6">
          A confirmation email has been sent to your inbox.
        </p>
      </div>
    </div>
  );
}

export default function OnboardSalonPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [businessModels, setBusinessModels] = useState<BusinessModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [onboardingResponse, setOnboardingResponse] = useState<{
    companyName: string;
    email: string;
  } | null>(null);

  const navigate = useNavigate();

  // Fetch business models on mount
  useEffect(() => {
    const fetchBusinessModels = async () => {
      try {
        const response = await gloabalApiService.businessModel();
        setBusinessModels(response.data);
      } catch (err) {
        const error = err as ApiError;
        console.error("Failed to fetch business models:", error.message);
        if (error)
          setErrorMessage("Failed to load business categories. Please refresh.");
      } finally {
        setLoadingModels(false);
      }
    };
    fetchBusinessModels();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleBusinessModel(modelId: number) {
    const modelCode = String(modelId);
    setForm((prev) => {
      const isSelected = prev.businessModel.includes(modelCode);
      return {
        ...prev,
        businessModel: isSelected
          ? prev.businessModel.filter((id) => id !== modelCode)
          : [...prev.businessModel, modelCode],
        // Clear subtypes if model is deselected
        subType: isSelected ? [] : prev.subType,
      };
    });
  }

  function toggleSubType(subTypeId: number) {
    const id = String(subTypeId);
    setForm((prev) => ({
      ...prev,
      subType: prev.subType.includes(id)
        ? prev.subType.filter((s) => s !== id)
        : [...prev.subType, id],
    }));
  }

  function updateWorkingTime(day: string, field: "openAt" | "closesAt", value: string) {
    setForm((prev) => ({
      ...prev,
      workingTime: prev.workingTime.map((t) =>
        t.day === day ? { ...t, [field]: value } : t
      ),
    }));
  }

  function toggleWorkingDay(day: string) {
    setForm((prev) => {
      const exists = prev.workingTime.some((t) => t.day === day);
      if (exists) {
        return {
          ...prev,
          workingTime: prev.workingTime.filter((t) => t.day !== day),
        };
      } else {
        // Add day with default times from first existing day or defaults
        const defaultTimes = prev.workingTime.length > 0
          ? { openAt: prev.workingTime[0].openAt, closesAt: prev.workingTime[0].closesAt }
          : { openAt: "09:00", closesAt: "20:00" };
        return {
          ...prev,
          workingTime: [...prev.workingTime, { day, ...defaultTimes }],
        };
      }
    });
  }

  const selectedModelIds = form.businessModel.map(Number);
  const selectedSubTypeIds = form.subType.map(Number);

  // Get selected business models
  const selectedModels = businessModels.filter((m) =>
    selectedModelIds.includes(m.id)
  );

  // Get available subtypes for selected models
  const availableSubTypes = businessModels
    .filter((m) => selectedModelIds.includes(m.id))
    .flatMap((m) => m.subtypes);

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!form.companyName.trim()) return "Give your company a name.";
      if (form.businessModel.length === 0) return "Select at least one business model.";
      if (form.subType.length === 0) return "Select at least one subtype.";
    }
    if (step === 1) {
      if (!form.domainName.trim()) return "Enter a domain name.";
      if (!form.timeZone) return "Select a time zone.";
      if (!form.currency) return "Select a currency.";
    }
    if (step === 2) {
      if (!form.branchName.trim()) return "Enter a branch name.";
      if (!form.branchCode.trim()) return "Enter a branch code.";
      if (!form.addressLine.trim()) return "Enter an address.";
      if (!form.region.trim()) return "Enter a region/city.";
      if (!form.country.trim()) return "Select a country.";
    }
    if (step === 3) {
      if (form.workingTime.length === 0) return "Set at least one working day.";
    }
    if (step === 4) {
      if (!form.fullName.trim()) return "Enter your full name.";
      if (!form.username.trim()) return "Choose a username.";
      if (!form.email.trim()) return "Enter your email.";
      if (!form.phone.trim()) return "Enter your phone number.";
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
      // Prepare onboarding data
      const onboardingData: OnboardRequestBody = {
        companyName: form.companyName,
        businessModel: form.businessModel,
        subType: form.subType,
        domainType: form.domainType,
        domainName: form.domainName,
        timeZone: form.timeZone,
        currency: form.currency,
        haveGST: form.haveGST,
        GST: form.haveGST ? form.GST : undefined,
        branchName: form.branchName,
        branchCode: form.branchCode,
        addressLine: form.addressLine,
        region: form.region,
        country: form.country,
        weekday: form.weekday,
        workingTime: form.workingTime,
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        phone: form.phone,
        avatar: form.avatar || undefined,
        logo: form.logo || undefined,
      };

      // Submit onboarding
      const result = await gloabalApiService.businessOnboard(onboardingData);

      // Store response data for success modal
      setOnboardingResponse({
        companyName: form.companyName,
        email: form.email,
      });

      // Show success modal
      setShowSuccess(true);
      setLoading(false);

    } catch (err: unknown) {
      if (isAxiosError<ApiError>(err) && err.response?.data) {
        setErrorMessage(err.response.data.message || "Couldn't complete onboarding. Please try again.");
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  function handleNavigateToDashboard() {
    setShowSuccess(false);
    navigate("/admin");
  }

  function handleCloseSuccess() {
    setShowSuccess(false);
  }

  if (loadingModels) {
    return (
      <div className="min-h-screen bg-sand-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-ink/60">Loading business categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-light">
      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleCloseSuccess}
        companyName={onboardingResponse?.companyName || ""}
        email={onboardingResponse?.email || ""}
        onNavigate={handleNavigateToDashboard}
      />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex mb-8">
          <Logo />
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-forest text-sand-light flex items-center justify-center shrink-0">
            <HiOutlineOfficeBuilding size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-ink">Onboard your business</h1>
            <p className="text-sm text-ink/60">Set up your company in a few quick steps.</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mt-8 mb-8 overflow-x-auto">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none min-w-fit">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border transition-colors ${i < step
                    ? "bg-forest border-forest text-sand-light"
                    : i === step
                      ? "border-forest text-forest bg-white"
                      : "border-blush text-ink/40 bg-white"
                    }`}
                >
                  {i < step ? <HiOutlineCheck size={14} /> : i + 1}
                </div>
                <span className={`text-[11px] text-center whitespace-nowrap ${i === step ? "text-ink" : "text-ink/40"
                  }`}>
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

          {/* Step 1 — Business Identity */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="companyName" className="text-sm text-ink/70">
                  Company name
                </label>
                <input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Glow & Co. Salon"
                  className={inputClass()}
                />
              </div>

              <div>
                <label className="text-sm text-ink/70 block mb-2">
                  Business models <span className="text-ink/40">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {businessModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => toggleBusinessModel(model.id)}
                      className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${form.businessModel.includes(String(model.id))
                        ? "border-forest bg-forest/5 text-ink"
                        : "border-blush text-ink/60 hover:border-forest/40"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.name}</span>
                        {form.businessModel.includes(String(model.id)) && (
                          <HiOutlineCheck className="text-forest" size={16} />
                        )}
                      </div>
                      {model.requiresMedicalDirector && (
                        <span className="text-xs text-orange-500 mt-0.5 block">
                          Requires medical director
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedModels.length > 0 && (
                <div>
                  <label className="text-sm text-ink/70 block mb-2">
                    Sub-types <span className="text-ink/40">(select all that apply)</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableSubTypes.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubType(sub.id)}
                        className={`text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${form.subType.includes(String(sub.id))
                          ? "border-forest bg-forest/5 text-ink"
                          : "border-blush text-ink/60 hover:border-forest/40"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{sub.name}</span>
                          {form.subType.includes(String(sub.id)) && (
                            <HiOutlineCheck className="text-forest" size={14} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Domain & Region */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="domainType" className="text-sm text-ink/70">
                  Domain type
                </label>
                <select
                  id="domainType"
                  value={form.domainType}
                  onChange={(e) => update("domainType", e.target.value as "self" | "default")}
                  className={`${inputClass()} bg-white`}
                >
                  <option value="default">Use default domain</option>
                  <option value="self">Use custom domain</option>
                </select>
              </div>

              <div>
                <label htmlFor="domainName" className="text-sm text-ink/70">
                  Domain name
                </label>
                <input
                  id="domainName"
                  value={form.domainName}
                  onChange={(e) => update("domainName", e.target.value)}
                  placeholder={form.domainType === "default" ? "glowco.bookings.com" : "glowco.com"}
                  className={inputClass()}
                />
                <p className="text-xs text-ink/40 mt-1.5">
                  {form.domainType === "default"
                    ? "A subdomain on our platform"
                    : "Your own custom domain (DNS configuration required)"}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timeZone" className="text-sm text-ink/70">
                    Time zone
                  </label>
                  <select
                    id="timeZone"
                    value={form.timeZone}
                    onChange={(e) => update("timeZone", e.target.value)}
                    className={`${inputClass()} bg-white`}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="currency" className="text-sm text-ink/70">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className={`${inputClass()} bg-white`}
                  >
                    <option value="INR">₹ INR</option>
                    <option value="USD">$ USD</option>
                    <option value="EUR">€ EUR</option>
                    <option value="GBP">£ GBP</option>
                    <option value="AED">د.إ AED</option>
                    <option value="AUD">$ AUD</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="haveGST"
                  checked={form.haveGST}
                  onChange={(e) => update("haveGST", e.target.checked)}
                  className="w-4 h-4 rounded border-blush text-forest focus:ring-forest"
                />
                <label htmlFor="haveGST" className="text-sm text-ink/70">
                  I have a GST/Tax registration number
                </label>
              </div>

              {form.haveGST && (
                <div>
                  <label htmlFor="GST" className="text-sm text-ink/70">
                    GST/Tax ID
                  </label>
                  <input
                    id="GST"
                    value={form.GST}
                    onChange={(e) => update("GST", e.target.value)}
                    placeholder="22AAAAA0000A1Z5"
                    className={inputClass()}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Branch Details */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="branchName" className="text-sm text-ink/70">
                    Branch name
                  </label>
                  <input
                    id="branchName"
                    value={form.branchName}
                    onChange={(e) => update("branchName", e.target.value)}
                    placeholder="Main Studio"
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label htmlFor="branchCode" className="text-sm text-ink/70">
                    Branch code
                  </label>
                  <input
                    id="branchCode"
                    value={form.branchCode}
                    onChange={(e) => update("branchCode", e.target.value)}
                    placeholder="BR-001"
                    className={inputClass()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="addressLine" className="text-sm text-ink/70">
                  Address
                </label>
                <input
                  id="addressLine"
                  value={form.addressLine}
                  onChange={(e) => update("addressLine", e.target.value)}
                  placeholder="12 MG Road, Indiranagar"
                  className={inputClass()}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="region" className="text-sm text-ink/70">
                    Region / City
                  </label>
                  <input
                    id="region"
                    value={form.region}
                    onChange={(e) => update("region", e.target.value)}
                    placeholder="Bengaluru"
                    className={inputClass()}
                  />
                </div>
                <div>
                  <label htmlFor="country" className="text-sm text-ink/70">
                    Country
                  </label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className={`${inputClass()} bg-white`}
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-ink/70 block mb-2">
                  Working days summary
                </label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => {
                    const hasDay = form.workingTime.some((t) => t.day === day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${hasDay
                          ? "bg-forest text-sand-light border-forest"
                          : "border-blush text-ink/60 hover:border-forest/40"
                          }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-ink/40 mt-2">
                  You'll set exact timings in the next step
                </p>
              </div>
            </div>
          )}

          {/* Step 4 — Hours */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              {form.workingTime.length === 0 ? (
                <div className="text-center py-8 text-ink/40">
                  <p>No working days selected. Go back and select at least one day.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {form.workingTime.map((timing) => (
                    <div key={timing.day} className="grid grid-cols-3 gap-3 items-center p-3 rounded-lg bg-sand-light/50">
                      <span className="text-sm font-medium text-ink">{timing.day}</span>
                      <input
                        type="time"
                        value={timing.openAt}
                        onChange={(e) => updateWorkingTime(timing.day, "openAt", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-blush text-sm outline-none focus:border-forest transition-colors bg-white"
                      />
                      <input
                        type="time"
                        value={timing.closesAt}
                        onChange={(e) => updateWorkingTime(timing.day, "closesAt", e.target.value)}
                        className="px-3 py-2 rounded-lg border border-blush text-sm outline-none focus:border-forest transition-colors bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Owner Account */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-ink/60">
                This becomes the admin account for {form.companyName || "your company"}.
              </p>

              <div>
                <label htmlFor="fullName" className="text-sm text-ink/70">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Ananya Verma"
                  className={inputClass()}
                />
              </div>

              <div>
                <label htmlFor="username" className="text-sm text-ink/70">
                  Username
                </label>
                <input
                  id="username"
                  value={form.username}
                  onChange={(e) => update("username", e.target.value)}
                  placeholder="ananya.v"
                  className={inputClass()}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="text-sm text-ink/70">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass()}
                  />
                </div>
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
              </div>

              {/* Review summary */}
              <div className="rounded-xl bg-sand p-4 text-sm text-ink/70 flex flex-col gap-1 mt-2">
                <p className="text-ink font-medium mb-1">Review</p>
                <p>
                  {form.companyName || "—"} · {selectedModels.map(m => m.name).join(", ") || "No model"}
                </p>
                <p>
                  {form.region || "—"} · {form.currency} · {form.timeZone.split("/")[1] || form.timeZone}
                </p>
                <p>
                  {form.branchName || "—"} · {form.workingTime.length} days/week
                </p>
                <p className="text-ink font-medium mt-1">Owner: {form.fullName || "—"}</p>
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