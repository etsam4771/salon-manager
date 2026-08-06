// AdminFinalizeOnboardPage.tsx
//
// Post-onboarding wizard for super_admin: shows until finalisation is done.
// Four steps:
//   1. Profile setup        — business + owner photos uploaded to
//                             POST /tenants/storeImages
//   2. Service categories   — default global categories + create your own
//   3. Service creation     — create tenant services with variations
//   4. Team & attendance    — attendance policy + staff onboarding
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineChevronDown,
  HiOutlinePlus,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineX,
} from "react-icons/hi";
import Button from "../../components/ui/Button";
import Logo from "../../components/ui/Logo";
import { onboardingService } from "../../api/services/onboarding.service";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type { BusinessModel, SubType } from "../../types/gloable.types";
import type {
  AttendancePolicyRequest,
  ServiceCategory,
  ServiceCreateRequest,
  StaffingOnboardRequest,
  TaxRegime,
} from "../../types/onboarding";
import type { EmploymentStatus, EmploymentType, UserRole } from "../../types/salon";
import type { ApiError } from "../../utils/response";

const STEPS_KEY = "salon:finalize_steps";
const PROFILE_KEY = "salon:finalize_profile";

// Progress is driven by GET /tenants/onboard-progress (25% per step). The
// localStorage list is only a fallback when the endpoint is unavailable.
const STEP_DEFS = [
  { id: "profile", label: "Profile", title: "Complete your profile", hint: "Business & owner photos" },
  { id: "categories", label: "Categories", title: "Service categories", hint: "Pick or create categories" },
  { id: "services", label: "Services", title: "Add your services", hint: "Pricing, duration, variations" },
  { id: "staff", label: "Team & attendance", title: "Team & attendance", hint: "Policy + staff onboarding" },
] as const;

type StepId = (typeof STEP_DEFS)[number]["id"];

interface ProfileState {
  logo: File | null;
  ownerImage: File | null;
}

interface ProfilePreviews {
  logo: string | null;
  ownerImage: string | null;
}

interface VariationDraft {
  name: string;
  priceModifier: string;
  durationModifier: string;
}

interface VariationGroupDraft {
  name: string;
  selectionType: "single" | "multiple";
  variations: VariationDraft[];
}

interface ServiceDraft {
  businessModelId: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  displayPrice: string;
  durationMins: string;
  variations: VariationGroupDraft[];
}

interface AttendanceForm {
  branchId: string;
  isEnabled: boolean;
  trackDailyAttendance: boolean;
  shiftManagementEnabled: boolean;
  clockInOutEnabled: boolean;
  breakTimeEnabled: boolean;
  lateArrivalTrackingEnabled: boolean;
  earlyLeavingTrackingEnabled: boolean;
  overtimeTrackingEnabled: boolean;
  leaveTrackingEnabled: boolean;
  holidayCalendarEnabled: boolean;
  graceMinutesLate: string;
  graceMinutesEarly: string;
  standardWorkMins: string;
  overtimeThresholdMins: string;
}

interface StaffForm {
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  employeeCode: string;
  designation: string;
  skills: string;
  commissionPct: string;
  joinedOn: string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  baseSalary: string;
  hourlyRate: string;
  overtimeRate: string;
  weeklyHoursTarget: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  panNumber: string;
  aadhaarNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  bankBranch: string;
  taxRegime: TaxRegime;
  pfApplicable: boolean;
  esiApplicable: boolean;
  ptApplicable: boolean;
  tdsApplicable: boolean;
  pfNumber: string;
  esiNumber: string;
  uanNumber: string;
  taxExemptionAmount: string;
}

const EMPTY_SERVICE: ServiceDraft = {
  businessModelId: "",
  categoryId: "",
  name: "",
  description: "",
  price: "",
  displayPrice: "",
  durationMins: "",
  variations: [],
};

const EMPTY_ATTENDANCE: AttendanceForm = {
  branchId: "",
  isEnabled: true,
  trackDailyAttendance: true,
  shiftManagementEnabled: true,
  clockInOutEnabled: true,
  breakTimeEnabled: false,
  lateArrivalTrackingEnabled: true,
  earlyLeavingTrackingEnabled: true,
  overtimeTrackingEnabled: false,
  leaveTrackingEnabled: true,
  holidayCalendarEnabled: true,
  graceMinutesLate: "10",
  graceMinutesEarly: "10",
  standardWorkMins: "480",
  overtimeThresholdMins: "540",
};

const EMPTY_STAFF: StaffForm = {
  role: "stylist",
  fullName: "",
  email: "",
  phone: "",
  employeeCode: "",
  designation: "",
  skills: "",
  commissionPct: "0",
  joinedOn: new Date().toISOString().slice(0, 10),
  employmentType: "full_time",
  employmentStatus: "active",
  baseSalary: "0",
  hourlyRate: "0",
  overtimeRate: "0",
  weeklyHoursTarget: "40",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  addressLine: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  panNumber: "",
  aadhaarNumber: "",
  bankAccountName: "",
  bankAccountNumber: "",
  bankIfsc: "",
  bankName: "",
  bankBranch: "",
  taxRegime: "new_regime",
  pfApplicable: false,
  esiApplicable: false,
  ptApplicable: false,
  tdsApplicable: false,
  pfNumber: "",
  esiNumber: "",
  uanNumber: "",
  taxExemptionAmount: "0",
};

const inputCls =
  "w-full rounded-lg border border-blush px-3.5 py-2.5 text-sm outline-none focus:border-forest transition-colors disabled:opacity-50 bg-white";

function errMsg(err: unknown, fallback: string): string {
  const e = err as ApiError;
  return e?.message || fallback;
}

function PhotoUpload({
  preview,
  onSelect,
  onRemove,
  title,
  hint,
}: {
  preview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  title: string;
  hint: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    onSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-dashed transition-colors ${preview ? "border-forest" : "border-blush"
          } bg-sand-light/60`}
      >
        {preview ? (
          <img src={preview} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-ink/40 text-center px-3">
            <HiOutlineCamera size={22} />
            <span className="text-xs mt-1">{hint}</span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-sm text-forest font-medium hover:underline"
        >
          Upload
        </button>
        {preview && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-ink/40 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-blush text-forest focus:ring-forest"
      />
      <span className="text-sm text-ink/70">{label}</span>
    </label>
  );
}

export default function AdminFinalizeOnboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stepIndex, setStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<StepId[]>(() => {
    try {
      const raw = localStorage.getItem(STEPS_KEY);
      return raw ? (JSON.parse(raw) as StepId[]) : [];
    } catch {
      return [];
    }
  });

  const [profile, setProfile] = useState<ProfileState>({ logo: null, ownerImage: null });
  const [profilePreviews, setProfilePreviews] = useState<ProfilePreviews>(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      return raw ? (JSON.parse(raw) as ProfilePreviews) : { logo: null, ownerImage: null };
    } catch {
      return { logo: null, ownerImage: null };
    }
  });

  const [branchModels, setBranchModels] = useState<BusinessModel[]>([]);
  const [branchSubModels, setBranchSubModels] = useState<SubType[]>([]);
  const [globalCategories, setGlobalCategories] = useState<ServiceCategory[]>([]);
  const [tenantCategories, setTenantCategories] = useState<ServiceCategory[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string; branchCode?: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  // Server-reported completion % from /tenants/onboard-progress. While null
  // (loading or endpoint unavailable) the bar falls back to local tracking.
  const [apiProgress, setApiProgress] = useState<number | null>(null);

  const [selectedGlobalIds, setSelectedGlobalIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySubtype, setNewCategorySubtype] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>(EMPTY_SERVICE);
  const [creatingService, setCreatingService] = useState(false);
  const [createdServices, setCreatedServices] = useState<ServiceCreateRequest[]>([]);

  const [attendance, setAttendance] = useState<AttendanceForm>(EMPTY_ATTENDANCE);
  const [policyCreated, setPolicyCreated] = useState(false);
  const [creatingPolicy, setCreatingPolicy] = useState(false);

  const [staffForm, setStaffForm] = useState<StaffForm>(EMPTY_STAFF);
  const [showStaffDetails, setShowStaffDetails] = useState(false);
  const [onboardingStaff, setOnboardingStaff] = useState(false);
  const [onboardedStaff, setOnboardedStaff] = useState<{ fullName: string; email: string; role: UserRole }[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const stepId = STEP_DEFS[stepIndex].id;
  const subtypeOptions = useMemo(
    () =>
      branchSubModels
        .map((item) => ({
          id: item.id,
          name: `${item.name}`,
        })),
    [branchSubModels]
  );
  const allCategories = useMemo(
    () =>
      [
        ...globalCategories.map((c) => ({ ...c, origin: "global" as const })),
        ...tenantCategories.map((c) => ({ ...c, origin: "custom" as const })),
      ].filter((item) =>
        branchSubModels.some(
          (subModel) =>
            subModel.businessModelId === Number(serviceDraft.businessModelId) &&
            subModel.id === item.subtypeId
        )
      ),
    [globalCategories, tenantCategories, serviceDraft.businessModelId, branchSubModels]
  );
  const isComplete = completedSteps.length === STEP_DEFS.length;

  const loadData = useCallback(async () => {
    try {
      const [globals, tenantCats, branchRes] = await Promise.all([
        onboardingService.getGlobalServiceCategories(),
        onboardingService.getTenantServiceCategories().catch(() => null),
        onboardingService.getBranches().catch(() => null),
      ]);
      const selectedBranch = branchRes?.data.at(0) ?? null;
      if (selectedBranch) {
        const subModel = await onboardingService.getBranchesBusinessSubModel(selectedBranch.id);
        const bmodel = await onboardingService.getBranchesBusinessModels(selectedBranch.id);
        setBranchSubModels(subModel.data);
        setBranchModels(bmodel.data)
        try {
          const prog = await onboardingService.getOnboardingProgress(selectedBranch.id);
          const { progress, currentStep } = prog.data;
          setApiProgress(progress);
          const currentIdx = STEP_DEFS.findIndex((s) => s.id === currentStep);
          if (progress >= 100 || currentIdx === -1) {
            // Backend considers the wizard done (or uses an unknown step
            // label) — treat every step as completed.
            setCompletedSteps(STEP_DEFS.map((s) => s.id));
            setStepIndex(0);
          } else {
            // Steps strictly before the current one are done; land the
            // user on the step the backend says they're on.
            setCompletedSteps(STEP_DEFS.slice(0, currentIdx).map((s) => s.id));
            setStepIndex(currentIdx);
          }
        } catch {
          // Progress endpoint is optional — keep local tracking.
        }
      }
      setGlobalCategories(globals.data);
      if (tenantCats) setTenantCategories(tenantCats.data);
      if (branchRes) setBranches(branchRes.data);
    } catch (err) {
      setDataError(errMsg(err, "Failed to load onboarding data. Please refresh."));
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    // Kick off the initial load off the effect's synchronous body so the
    // fetch's setStates never run in a cascading-render path.
    void Promise.resolve().then(loadData);
  }, [loadData]);

  useEffect(() => {
    localStorage.setItem(STEPS_KEY, JSON.stringify(completedSteps));
  }, [completedSteps]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profilePreviews));
  }, [profilePreviews]);

  const activeBranchId = attendance.branchId || branches[0]?.id || "";

  const markComplete = (id: StepId) => {
    if (completedSteps.includes(id)) return;
    setCompletedSteps((prev) => [...prev, id]);
    // Server doesn't expose a "mark step done" call, so bump the bar
    // locally by one step's share on top of the reported percentage.
    if (apiProgress !== null) {
      setApiProgress((p) => Math.min((p ?? 0) + 25, 100));
    }
  };

  const goNext = () => {
    setError(null);
    setStepIndex((i) => Math.min(i + 1, STEP_DEFS.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const selectPhoto = (kind: keyof ProfileState, file: File) => {
    setProfile((prev) => ({ ...prev, [kind]: file }));
    setProfilePreviews((prev) => ({ ...prev, [kind]: URL.createObjectURL(file) }));
  };

  const removePhoto = (kind: keyof ProfileState) => {
    setProfile((prev) => ({ ...prev, [kind]: null }));
    setProfilePreviews((prev) => ({ ...prev, [kind]: null }));
  };

  const saveProfile = async () => {
    setError(null);
    if (!profile.logo && !profile.ownerImage) {
      markComplete("profile");
      showToast("Photos can be added later from Settings", "info");
      goNext();
      return;
    }
    setUploadingProfile(true);
    try {
      await onboardingService.storeTenantImages({
        logo: profile.logo ?? undefined,
        ownerImage: profile.ownerImage ?? undefined,
      });
      markComplete("profile");
      showToast("Profile photos uploaded", "success");
      goNext();
    } catch (err) {
      setError(errMsg(err, "Couldn't upload the photos."));
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleCreateCategory = async () => {
    setError(null);
    if (!newCategoryName.trim()) {
      setError("Give the category a name.");
      return;
    }
    if (!newCategorySubtype) {
      setError("Select a business sub-type for the category.");
      return;
    }
    setCreatingCategory(true);
    try {
      await onboardingService.createServiceCategory({
        name: newCategoryName.trim(),
        subtypeId: Number(newCategorySubtype),
      });
      showToast("Category created", "success");
      setNewCategoryName("");
      setNewCategorySubtype("");
      const res = await onboardingService.getTenantServiceCategories();
      setTenantCategories(res.data);
    } catch (err) {
      setError(errMsg(err, "Couldn't create the category."));
    } finally {
      setCreatingCategory(false);
    }
  };

  const useCategories = () => {
    if (selectedGlobalIds.length === 0 && tenantCategories.length === 0) {
      setError("Select at least one global category or create your own.");
      return;
    }
    markComplete("categories");
    goNext();
  };

  const addVariationGroup = () => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        { name: "", selectionType: "single", variations: [{ name: "", priceModifier: "0", durationModifier: "0" }] },
      ],
    }));
  };

  const updateVariationGroup = (gi: number, patch: Partial<VariationGroupDraft>) => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: prev.variations.map((g, i) => (i === gi ? { ...g, ...patch } : g)),
    }));
  };

  const updateVariation = (gi: number, vi: number, patch: Partial<VariationDraft>) => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: prev.variations.map((g, i) =>
        i === gi ? { ...g, variations: g.variations.map((v, j) => (j === vi ? { ...v, ...patch } : v)) } : g
      ),
    }));
  };

  const addVariation = (gi: number) => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: prev.variations.map((g, i) =>
        i === gi ? { ...g, variations: [...g.variations, { name: "", priceModifier: "0", durationModifier: "0" }] } : g
      ),
    }));
  };

  const removeVariation = (gi: number, vi: number) => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: prev.variations.map((g, i) =>
        i === gi ? { ...g, variations: g.variations.filter((_, j) => j !== vi) } : g
      ),
    }));
  };

  const removeVariationGroup = (gi: number) => {
    setServiceDraft((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== gi),
    }));
  };

  const handleCreateService = async () => {
    setError(null);
    if (!serviceDraft.businessModelId) {
      setError("Select a business model.");
      return;
    }
    if (!serviceDraft.categoryId) {
      setError("Select a category.");
      return;
    }
    if (!serviceDraft.name.trim()) {
      setError("Give the service a name.");
      return;
    }
    const price = Number(serviceDraft.price);
    const durationMins = Number(serviceDraft.durationMins);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price.");
      return;
    }
    if (!Number.isFinite(durationMins) || durationMins <= 0) {
      setError("Enter a valid duration (minutes).");
      return;
    }

    const payload: ServiceCreateRequest = {
      businessModelId: Number(serviceDraft.businessModelId),
      categoryId: Number(serviceDraft.categoryId),
      name: serviceDraft.name.trim(),
      description: serviceDraft.description.trim(),
      price,
      displayPrice: Number(serviceDraft.displayPrice) || 0,
      durationMins,
      variations: serviceDraft.variations
        .filter((g) => g.name.trim() && g.variations.some((v) => v.name.trim()))
        .map((g) => ({
          name: g.name.trim(),
          selectionType: g.selectionType,
          serviceVariations: g.variations
            .filter((v) => v.name.trim())
            .map((v) => ({
              name: v.name.trim(),
              priceModifier: Number(v.priceModifier) || 0,
              durationModifier: Number(v.durationModifier) || 0,
            })),
        })),
    };

    setCreatingService(true);
    try {
      await onboardingService.createService(payload);
      setCreatedServices((prev) => [...prev, payload]);
      setServiceDraft(EMPTY_SERVICE);
      markComplete("services");
      showToast(`"${payload.name}" created`, "success");
    } catch (err) {
      setError(errMsg(err, "Couldn't create the service."));
    } finally {
      setCreatingService(false);
    }
  };

  const handleCreatePolicy = async () => {
    setError(null);
    if (!activeBranchId) {
      setError("No branch available — create one first.");
      return;
    }
    const policy: AttendancePolicyRequest = {
      branchId: activeBranchId,
      isEnabled: attendance.isEnabled,
      trackDailyAttendance: attendance.trackDailyAttendance,
      shiftManagementEnabled: attendance.shiftManagementEnabled,
      clockInOutEnabled: attendance.clockInOutEnabled,
      breakTimeEnabled: attendance.breakTimeEnabled,
      lateArrivalTrackingEnabled: attendance.lateArrivalTrackingEnabled,
      earlyLeavingTrackingEnabled: attendance.earlyLeavingTrackingEnabled,
      overtimeTrackingEnabled: attendance.overtimeTrackingEnabled,
      leaveTrackingEnabled: attendance.leaveTrackingEnabled,
      holidayCalendarEnabled: attendance.holidayCalendarEnabled,
      graceMinutesLate: Number(attendance.graceMinutesLate) || 0,
      graceMinutesEarly: Number(attendance.graceMinutesEarly) || 0,
      standardWorkMins: Number(attendance.standardWorkMins) || 0,
      overtimeThresholdMins: Number(attendance.overtimeThresholdMins) || 0,
    };
    setCreatingPolicy(true);
    try {
      await onboardingService.createAttendancePolicy(policy);
      setPolicyCreated(true);
      markComplete("staff");
      showToast("Attendance policy saved", "success");
    } catch (err) {
      setError(errMsg(err, "Couldn't save the attendance policy."));
    } finally {
      setCreatingPolicy(false);
    }
  };

  const handleOnboardStaff = async () => {
    setError(null);
    if (!activeBranchId) {
      setError("Set a branch (attendance policy) first.");
      return;
    }
    if (!staffForm.fullName.trim() || !staffForm.email.trim() || !staffForm.phone.trim()) {
      setError("Full name, email and phone are required.");
      return;
    }
    const payload: StaffingOnboardRequest = {
      branchId: activeBranchId,
      role: staffForm.role,
      fullName: staffForm.fullName.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      employeeCode: staffForm.employeeCode.trim() || undefined,
      designation: staffForm.designation.trim() || undefined,
      skills: staffForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
      commissionPct: Number(staffForm.commissionPct) || 0,
      joinedOn: staffForm.joinedOn,
      employmentType: staffForm.employmentType,
      employmentStatus: staffForm.employmentStatus,
      baseSalary: Number(staffForm.baseSalary) || 0,
      hourlyRate: Number(staffForm.hourlyRate) || 0,
      overtimeRate: Number(staffForm.overtimeRate) || 0,
      weeklyHoursTarget: Number(staffForm.weeklyHoursTarget) || 0,
      dateOfBirth: staffForm.dateOfBirth || undefined,
      gender: staffForm.gender || undefined,
      maritalStatus: staffForm.maritalStatus || undefined,
      addressLine: staffForm.addressLine || undefined,
      city: staffForm.city || undefined,
      state: staffForm.state || undefined,
      country: staffForm.country || undefined,
      pincode: staffForm.pincode || undefined,
      emergencyContactName: staffForm.emergencyContactName || undefined,
      emergencyContactPhone: staffForm.emergencyContactPhone || undefined,
      panNumber: staffForm.panNumber || undefined,
      aadhaarNumber: staffForm.aadhaarNumber || undefined,
      bankAccountName: staffForm.bankAccountName || undefined,
      bankAccountNumber: staffForm.bankAccountNumber || undefined,
      bankIfsc: staffForm.bankIfsc || undefined,
      bankName: staffForm.bankName || undefined,
      bankBranch: staffForm.bankBranch || undefined,
      taxRegime: staffForm.taxRegime,
      pfApplicable: staffForm.pfApplicable,
      esiApplicable: staffForm.esiApplicable,
      ptApplicable: staffForm.ptApplicable,
      tdsApplicable: staffForm.tdsApplicable,
      pfNumber: staffForm.pfNumber || undefined,
      esiNumber: staffForm.esiNumber || undefined,
      uanNumber: staffForm.uanNumber || undefined,
      taxExemptionAmount: Number(staffForm.taxExemptionAmount) || 0,
    };
    setOnboardingStaff(true);
    try {
      await onboardingService.onboardStaff(payload);
      setOnboardedStaff((prev) => [
        ...prev,
        { fullName: payload.fullName, email: payload.email, role: payload.role },
      ]);
      setStaffForm((prev) => ({ ...EMPTY_STAFF, role: prev.role }));
      markComplete("staff");
      showToast(`${payload.fullName} added to your team`, "success");
    } catch (err) {
      setError(errMsg(err, "Couldn't onboard the staff member."));
    } finally {
      setOnboardingStaff(false);
    }
  };

  const progress = apiProgress ?? Math.round((completedSteps.length / STEP_DEFS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-light to-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/60 hidden sm:inline">{user?.email || "User"}</span>
            <Button variant="secondary" size="sm" onClick={() => navigate("/admin")}>
              Continue later
            </Button>
          </div>
        </div>

        {/* Welcome + progress */}
        <div className="bg-white rounded-2xl border border-blush/60 p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
              <HiOutlineSparkles className="w-8 h-8 text-forest" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl text-ink mb-2">
                {isComplete ? "Your business is ready!" : "Let's finish setting up your business"}
              </h1>
              <p className="text-ink/60">
                {isComplete
                  ? "Everything is in place. Head to your dashboard to start accepting bookings."
                  : "A few quick steps and you'll be live. You can always come back to these later."}
              </p>
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-ink/60 mb-2">
                  <span>Setup progress</span>
                  <span className="font-medium text-ink">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-blush/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div className="bg-white rounded-2xl border border-blush/60 p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-ink/60">Loading your workspace…</p>
          </div>
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
              {STEP_DEFS.map((step, i) => {
                const done = completedSteps.includes(step.id) || i < stepIndex;
                const active = i === stepIndex;
                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none min-w-fit">
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono border transition-colors ${done
                          ? "bg-forest border-forest text-sand-light"
                          : active
                            ? "border-forest text-forest bg-white"
                            : "border-blush text-ink/40 bg-white"
                          }`}
                      >
                        {done ? <HiOutlineCheck size={15} /> : i + 1}
                      </div>
                      <span
                        className={`text-[11px] text-center whitespace-nowrap ${active ? "text-ink font-medium" : "text-ink/40"
                          }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < STEP_DEFS.length - 1 && (
                      <div className={`h-px flex-1 mx-2 ${done ? "bg-forest" : "bg-blush"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-blush/60 p-6 md:p-8">
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              {dataError && (
                <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  {dataError}{" "}
                  <button
                    onClick={() => {
                      setDataError(null);
                      setLoadingData(true);
                      loadData();
                    }}
                    className="underline font-medium"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ============ Step 1 — Profile ============ */}
              {stepId === "profile" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink mb-1">{STEP_DEFS[0].title}</h2>
                    <p className="text-sm text-ink/60">
                      Add photos so customers recognise your business. They're uploaded to your
                      tenant profile when you continue.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <PhotoUpload
                      preview={profilePreviews.logo}
                      onSelect={(file) => selectPhoto("logo", file)}
                      onRemove={() => removePhoto("logo")}
                      title="Business logo"
                      hint="Business logo / photo"
                    />
                    <PhotoUpload
                      preview={profilePreviews.ownerImage}
                      onSelect={(file) => selectPhoto("ownerImage", file)}
                      onRemove={() => removePhoto("ownerImage")}
                      title="Owner photo"
                      hint="Owner profile photo"
                    />
                  </div>
                  <div className="rounded-xl bg-sand p-4 text-sm text-ink/70 flex flex-col gap-1">
                    <p className="text-ink font-medium mb-1">Account</p>
                    <p>
                      Email: <span className="font-medium text-ink">{user?.email || "—"}</span>
                    </p>
                    <p>
                      Role: <span className="font-medium text-ink capitalize">Super admin</span>
                    </p>
                  </div>
                </div>
              )}

              {/* ============ Step 2 — Categories ============ */}
              {stepId === "categories" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink mb-1">{STEP_DEFS[1].title}</h2>
                    <p className="text-sm text-ink/60">
                      Pick default categories from our global catalogue, or create your own.
                    </p>
                  </div>

                  {globalCategories.length > 0 && (
                    <div>
                      <label className="text-sm text-ink/70 block mb-2">
                        Default global categories{" "}
                        <span className="text-ink/40">(select all that apply)</span>
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {globalCategories.map((cat) => {
                          const selected = selectedGlobalIds.includes(cat.id);
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() =>
                                setSelectedGlobalIds((prev) =>
                                  selected
                                    ? prev.filter((id) => id !== cat.id)
                                    : [...prev, cat.id]
                                )
                              }
                              className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${selected
                                ? "border-forest bg-forest/5 text-ink"
                                : "border-blush text-ink/60 hover:border-forest/40"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{cat.name}</span>
                                {selected && <HiOutlineCheck className="text-forest shrink-0" size={16} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-blush/40 pt-6">
                    <label className="text-sm text-ink/70 block mb-2">
                      Create your own category
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name (e.g. Bridal Makeup)"
                        className={inputCls}
                      />
                      <select
                        value={newCategorySubtype}
                        onChange={(e) => setNewCategorySubtype(e.target.value)}
                        className={`${inputCls} bg-white`}
                      >
                        <option value="">Business sub-type</option>
                        {subtypeOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-3 gap-1.5"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory}
                    >
                      <HiOutlinePlus size={14} />
                      {creatingCategory ? "Creating…" : "Create category"}
                    </Button>
                  </div>

                  {tenantCategories.length > 0 && (
                    <div>
                      <label className="text-sm text-ink/70 block mb-2">Your categories</label>
                      <div className="flex flex-wrap gap-2">
                        {tenantCategories.map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-forest/5 text-forest border border-forest/30"
                          >
                            <HiOutlineCheck size={12} />
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============ Step 3 — Services ============ */}
              {stepId === "services" && (
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 className="font-display text-2xl text-ink mb-1">{STEP_DEFS[2].title}</h2>
                    <p className="text-sm text-ink/60">
                      Add a service to your menu. You can add more later from the Services page.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-ink/70 block mb-1.5">Business model</label>
                      <select
                        value={serviceDraft.businessModelId}
                        onChange={(e) =>
                          setServiceDraft((prev) => ({ ...prev, businessModelId: e.target.value }))
                        }
                        className={`${inputCls} bg-white`}
                      >
                        <option value="">Select business model</option>
                        {branchModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-ink/70 block mb-1.5">Category</label>
                      <select
                        value={serviceDraft.categoryId}
                        onChange={(e) =>
                          setServiceDraft((prev) => ({ ...prev, categoryId: e.target.value }))
                        }
                        className={`${inputCls} bg-white`}
                      >
                        <option value="">Select category</option>
                        {allCategories.map((c) => (
                          <option key={`${c.origin}-${c.id}`} value={c.id}>
                            {c.name} {c.origin === "global" ? "(Default)" : "(Custom)"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-ink/70 block mb-1.5">Service name</label>
                    <input
                      value={serviceDraft.name}
                      onChange={(e) => setServiceDraft((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Signature Hair Spa"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-ink/70 block mb-1.5">Description</label>
                    <textarea
                      value={serviceDraft.description}
                      onChange={(e) =>
                        setServiceDraft((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Short description shown to customers"
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm text-ink/70 block mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={serviceDraft.price}
                        onChange={(e) =>
                          setServiceDraft((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="1200"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-ink/70 block mb-1.5">
                        Display price{" "}
                        <span className="text-ink/40">(strikethrough, optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={serviceDraft.displayPrice}
                        onChange={(e) =>
                          setServiceDraft((prev) => ({ ...prev, displayPrice: e.target.value }))
                        }
                        placeholder="1500"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-ink/70 block mb-1.5">Duration (mins)</label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={serviceDraft.durationMins}
                        onChange={(e) =>
                          setServiceDraft((prev) => ({ ...prev, durationMins: e.target.value }))
                        }
                        placeholder="60"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Variation groups */}
                  <div className="border-t border-blush/40 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm text-ink/70 block">
                        Variations{" "}
                        <span className="text-ink/40">(optional — e.g. duration, add-on)</span>
                      </label>
                      <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={addVariationGroup}>
                        <HiOutlinePlus size={14} /> Add group
                      </Button>
                    </div>

                    {serviceDraft.variations.length === 0 ? (
                      <p className="text-sm text-ink/40">
                        No variations yet — skip or add a group like "Duration" with 30/45/60 min
                        options.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {serviceDraft.variations.map((group, gi) => (
                          <div key={gi} className="rounded-xl border border-blush/60 p-4 bg-sand-light/40">
                            <div className="grid sm:grid-cols-[1fr_220px_auto] gap-3 mb-4">
                              <div>
                                <label className="text-xs font-medium text-ink/60 block mb-1">
                                  Group name
                                </label>
                                <input
                                  value={group.name}
                                  onChange={(e) => updateVariationGroup(gi, { name: e.target.value })}
                                  placeholder="e.g. Duration"
                                  className={inputCls}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-ink/60 block mb-1">
                                  Selection type
                                </label>
                                <select
                                  value={group.selectionType}
                                  onChange={(e) =>
                                    updateVariationGroup(gi, {
                                      selectionType: e.target.value as "single" | "multiple",
                                    })
                                  }
                                  className={`${inputCls} bg-white`}
                                >
                                  <option value="single">Single choice</option>
                                  <option value="multiple">Multiple choice</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeVariationGroup(gi)}
                                className="text-ink/40 hover:text-red-500 shrink-0 self-end mb-1 py-2.5"
                                aria-label="Remove group"
                              >
                                <HiOutlineTrash size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-[1fr_140px_140px_auto] gap-2 items-center mb-1.5 text-xs font-medium text-ink/50">
                              <span>Option name</span>
                              <span>Price modifier (₹)</span>
                              <span>Duration modifier (min)</span>
                              <span />
                            </div>

                            <div className="space-y-2">
                              {group.variations.map((v, vi) => (
                                <div key={vi} className="grid grid-cols-[1fr_140px_140px_auto] gap-2 items-center">
                                  <input
                                    value={v.name}
                                    onChange={(e) => updateVariation(gi, vi, { name: e.target.value })}
                                    placeholder="e.g. 45 min"
                                    className={inputCls}
                                  />
                                  <input
                                    type="number"
                                    value={v.priceModifier}
                                    onChange={(e) =>
                                      updateVariation(gi, vi, { priceModifier: e.target.value })
                                    }
                                    placeholder="+100"
                                    className={inputCls}
                                  />
                                  <input
                                    type="number"
                                    value={v.durationModifier}
                                    onChange={(e) =>
                                      updateVariation(gi, vi, { durationModifier: e.target.value })
                                    }
                                    placeholder="+15"
                                    className={inputCls}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeVariation(gi, vi)}
                                    className="text-ink/40 hover:text-red-500"
                                    aria-label="Remove variation"
                                  >
                                    <HiOutlineX size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-3 gap-1"
                              onClick={() => addVariation(gi)}
                            >
                              <HiOutlinePlus size={13} /> Add option
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      className="gap-1.5"
                      onClick={handleCreateService}
                      disabled={creatingService}
                    >
                      <HiOutlinePlus size={15} />
                      {creatingService ? "Creating…" : "Add service"}
                    </Button>
                    {createdServices.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {createdServices.map((s, i) => (
                          <span
                            key={`${s.name}-${i}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                          >
                            <HiOutlineCheck size={12} />
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============ Step 4 — Team & attendance ============ */}
              {stepId === "staff" && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h2 className="font-display text-2xl text-ink mb-1">{STEP_DEFS[3].title}</h2>
                    <p className="text-sm text-ink/60">
                      Set attendance rules for your branch, then onboard your first team members.
                    </p>
                  </div>

                  {/* Attendance policy */}
                  <section className="rounded-xl border border-blush/60 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-ink">Attendance policy</h3>
                        <p className="text-sm text-ink/50">
                          {policyCreated ? "Saved to your branch" : "Required before onboarding staff"}
                        </p>
                      </div>
                      {policyCreated && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <HiOutlineCheck size={12} /> Saved
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Branch</label>
                        <select
                          value={activeBranchId}
                          onChange={(e) =>
                            setAttendance((prev) => ({ ...prev, branchId: e.target.value }))
                          }
                          className={`${inputCls} bg-white`}
                          disabled={policyCreated}
                        >
                          {branches.length === 0 && <option value="">No branches found</option>}
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                              {b.branchCode ? ` (${b.branchCode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3 self-end">
                        <div>
                          <label className="text-sm text-ink/70 block mb-1.5">Late grace (min)</label>
                          <input
                            type="number"
                            min="0"
                            value={attendance.graceMinutesLate}
                            onChange={(e) =>
                              setAttendance((prev) => ({
                                ...prev,
                                graceMinutesLate: e.target.value,
                              }))
                            }
                            className={inputCls}
                            disabled={policyCreated}
                          />
                        </div>
                        <div>
                          <label className="text-sm text-ink/70 block mb-1.5">Early grace (min)</label>
                          <input
                            type="number"
                            min="0"
                            value={attendance.graceMinutesEarly}
                            onChange={(e) =>
                              setAttendance((prev) => ({
                                ...prev,
                                graceMinutesEarly: e.target.value,
                              }))
                            }
                            className={inputCls}
                            disabled={policyCreated}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">
                          Standard work day (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={attendance.standardWorkMins}
                          onChange={(e) =>
                            setAttendance((prev) => ({
                              ...prev,
                              standardWorkMins: e.target.value,
                            }))
                          }
                          className={inputCls}
                          disabled={policyCreated}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">
                          Overtime threshold (min)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={attendance.overtimeThresholdMins}
                          onChange={(e) =>
                            setAttendance((prev) => ({
                              ...prev,
                              overtimeThresholdMins: e.target.value,
                            }))
                          }
                          className={inputCls}
                          disabled={policyCreated}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mt-5">
                      <Toggle
                        checked={attendance.isEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, isEnabled: v }))}
                        label="Attendance enabled"
                      />
                      <Toggle
                        checked={attendance.trackDailyAttendance}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, trackDailyAttendance: v }))}
                        label="Track daily attendance"
                      />
                      <Toggle
                        checked={attendance.shiftManagementEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, shiftManagementEnabled: v }))}
                        label="Shift management"
                      />
                      <Toggle
                        checked={attendance.clockInOutEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, clockInOutEnabled: v }))}
                        label="Clock in / out"
                      />
                      <Toggle
                        checked={attendance.breakTimeEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, breakTimeEnabled: v }))}
                        label="Break time tracking"
                      />
                      <Toggle
                        checked={attendance.lateArrivalTrackingEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, lateArrivalTrackingEnabled: v }))}
                        label="Late arrival tracking"
                      />
                      <Toggle
                        checked={attendance.earlyLeavingTrackingEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, earlyLeavingTrackingEnabled: v }))}
                        label="Early leaving tracking"
                      />
                      <Toggle
                        checked={attendance.overtimeTrackingEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, overtimeTrackingEnabled: v }))}
                        label="Overtime tracking"
                      />
                      <Toggle
                        checked={attendance.leaveTrackingEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, leaveTrackingEnabled: v }))}
                        label="Leave tracking"
                      />
                      <Toggle
                        checked={attendance.holidayCalendarEnabled}
                        onChange={(v) => setAttendance((prev) => ({ ...prev, holidayCalendarEnabled: v }))}
                        label="Holiday calendar"
                      />
                    </div>

                    <Button
                      type="button"
                      variant={policyCreated ? "secondary" : "primary"}
                      size="sm"
                      className="mt-5 gap-1.5"
                      onClick={handleCreatePolicy}
                      disabled={creatingPolicy || policyCreated}
                    >
                      <HiOutlineCheck size={14} />
                      {creatingPolicy
                        ? "Saving…"
                        : policyCreated
                          ? "Policy saved"
                          : "Save attendance policy"}
                    </Button>
                  </section>

                  {/* Staff onboarding */}
                  <section className="rounded-xl border border-blush/60 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-ink">Onboard a team member</h3>
                        <p className="text-sm text-ink/50">
                          {onboardedStaff.length > 0
                            ? `${onboardedStaff.length} added so far`
                            : "Add your first staff member"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => setShowStaffDetails((v) => !v)}
                      >
                        {showStaffDetails ? "Hide" : "Show"} payroll details
                        <HiOutlineChevronDown
                          size={14}
                          className={`transition-transform ${showStaffDetails ? "rotate-180" : ""}`}
                        />
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Role</label>
                        <select
                          value={staffForm.role}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, role: e.target.value as UserRole }))
                          }
                          className={`${inputCls} bg-white`}
                        >
                          <option value="owner">Owner</option>
                          <option value="manager">Manager</option>
                          <option value="receptionist">Receptionist</option>
                          <option value="stylist">Stylist</option>
                          <option value="staff">Staff</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Full name</label>
                        <input
                          value={staffForm.fullName}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, fullName: e.target.value }))
                          }
                          placeholder="Priya Sharma"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Email</label>
                        <input
                          type="email"
                          value={staffForm.email}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="priya@example.com"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Phone</label>
                        <input
                          value={staffForm.phone}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="+91 98xxx xxxxx"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Employee code</label>
                        <input
                          value={staffForm.employeeCode}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, employeeCode: e.target.value }))
                          }
                          placeholder="EMP-002"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Designation</label>
                        <input
                          value={staffForm.designation}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, designation: e.target.value }))
                          }
                          placeholder="Senior Stylist"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">
                          Skills <span className="text-ink/40">(comma separated)</span>
                        </label>
                        <input
                          value={staffForm.skills}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, skills: e.target.value }))
                          }
                          placeholder="Coloring, Keratin, Cuts"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Joined on</label>
                        <input
                          type="date"
                          value={staffForm.joinedOn}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, joinedOn: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-ink/70 block mb-1.5">
                            Employment type
                          </label>
                          <select
                            value={staffForm.employmentType}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                employmentType: e.target.value as EmploymentType,
                              }))
                            }
                            className={`${inputCls} bg-white`}
                          >
                            <option value="full_time">Full time</option>
                            <option value="part_time">Part time</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="service_based">Service based</option>
                            <option value="hourly_paid">Hourly paid</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-ink/70 block mb-1.5">
                            Employment status
                          </label>
                          <select
                            value={staffForm.employmentStatus}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                employmentStatus: e.target.value as EmploymentStatus,
                              }))
                            }
                            className={`${inputCls} bg-white`}
                          >
                            <option value="active">Active</option>
                            <option value="on_probation">On probation</option>
                            <option value="on_leave">On leave</option>
                            <option value="suspended">Suspended</option>
                            <option value="resigned">Resigned</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Commission %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={staffForm.commissionPct}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, commissionPct: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Base salary (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={staffForm.baseSalary}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, baseSalary: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">Hourly rate (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={staffForm.hourlyRate}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, hourlyRate: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-ink/70 block mb-1.5">
                          Weekly hrs target
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={staffForm.weeklyHoursTarget}
                          onChange={(e) =>
                            setStaffForm((prev) => ({ ...prev, weeklyHoursTarget: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {showStaffDetails && (
                      <div className="mt-5 pt-5 border-t border-blush/40">
                        <p className="text-sm font-medium text-ink mb-3">Payroll, KYC & banking</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={staffForm.dateOfBirth}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                            }
                            className={inputCls}
                            placeholder="DOB"
                          />
                          <input
                            value={staffForm.gender}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, gender: e.target.value }))
                            }
                            placeholder="Gender"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.maritalStatus}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, maritalStatus: e.target.value }))
                            }
                            placeholder="Marital status"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.addressLine}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, addressLine: e.target.value }))
                            }
                            placeholder="Address"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.city}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, city: e.target.value }))
                            }
                            placeholder="City"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.state}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, state: e.target.value }))
                            }
                            placeholder="State"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.country}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, country: e.target.value }))
                            }
                            placeholder="Country"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.pincode}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, pincode: e.target.value }))
                            }
                            placeholder="Pincode"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.emergencyContactName}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                emergencyContactName: e.target.value,
                              }))
                            }
                            placeholder="Emergency contact name"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.emergencyContactPhone}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                emergencyContactPhone: e.target.value,
                              }))
                            }
                            placeholder="Emergency contact phone"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.panNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, panNumber: e.target.value }))
                            }
                            placeholder="PAN number"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.aadhaarNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, aadhaarNumber: e.target.value }))
                            }
                            placeholder="Aadhaar number"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.bankAccountName}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, bankAccountName: e.target.value }))
                            }
                            placeholder="Bank account name"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.bankAccountNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                bankAccountNumber: e.target.value,
                              }))
                            }
                            placeholder="Bank account number"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.bankIfsc}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, bankIfsc: e.target.value }))
                            }
                            placeholder="IFSC code"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.bankName}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, bankName: e.target.value }))
                            }
                            placeholder="Bank name"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.bankBranch}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, bankBranch: e.target.value }))
                            }
                            placeholder="Bank branch"
                            className={inputCls}
                          />
                          <select
                            value={staffForm.taxRegime}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                taxRegime: e.target.value as TaxRegime,
                              }))
                            }
                            className={`${inputCls} bg-white`}
                          >
                            <option value="new_regime">New tax regime</option>
                            <option value="old_regime">Old tax regime</option>
                            <option value="not_applicable">Not applicable</option>
                          </select>
                          <input
                            value={staffForm.pfNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, pfNumber: e.target.value }))
                            }
                            placeholder="PF number"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.esiNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, esiNumber: e.target.value }))
                            }
                            placeholder="ESI number"
                            className={inputCls}
                          />
                          <input
                            value={staffForm.uanNumber}
                            onChange={(e) =>
                              setStaffForm((prev) => ({ ...prev, uanNumber: e.target.value }))
                            }
                            placeholder="UAN number"
                            className={inputCls}
                          />
                          <input
                            type="number"
                            min="0"
                            value={staffForm.taxExemptionAmount}
                            onChange={(e) =>
                              setStaffForm((prev) => ({
                                ...prev,
                                taxExemptionAmount: e.target.value,
                              }))
                            }
                            placeholder="Tax exemption amount"
                            className={inputCls}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5 mt-4">
                          <Toggle
                            checked={staffForm.pfApplicable}
                            onChange={(v) => setStaffForm((prev) => ({ ...prev, pfApplicable: v }))}
                            label="PF applicable"
                          />
                          <Toggle
                            checked={staffForm.esiApplicable}
                            onChange={(v) => setStaffForm((prev) => ({ ...prev, esiApplicable: v }))}
                            label="ESI applicable"
                          />
                          <Toggle
                            checked={staffForm.ptApplicable}
                            onChange={(v) => setStaffForm((prev) => ({ ...prev, ptApplicable: v }))}
                            label="PT applicable"
                          />
                          <Toggle
                            checked={staffForm.tdsApplicable}
                            onChange={(v) => setStaffForm((prev) => ({ ...prev, tdsApplicable: v }))}
                            label="TDS applicable"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-5">
                      <Button
                        type="button"
                        className="gap-1.5"
                        onClick={handleOnboardStaff}
                        disabled={onboardingStaff}
                      >
                        <HiOutlinePlus size={15} />
                        {onboardingStaff ? "Adding…" : "Add team member"}
                      </Button>
                      {onboardedStaff.map((s, i) => (
                        <span
                          key={`${s.email}-${i}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"
                        >
                          <HiOutlineCheck size={12} />
                          {s.fullName}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Nav buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-blush/40">
                {stepIndex > 0 ? (
                  <Button variant="secondary" type="button" onClick={goBack} className="gap-1.5">
                    <HiOutlineArrowLeft size={14} /> Back
                  </Button>
                ) : (
                  <span />
                )}

                {isComplete ? (
                  <Button type="button" className="gap-2 px-8" onClick={() => navigate("/admin")}>
                    Go to Dashboard <HiOutlineArrowRight size={15} />
                  </Button>
                ) : (
                  <div className="flex items-center gap-3">
                    {stepIndex < 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          markComplete(stepId);
                          goNext();
                        }}
                        className="text-sm text-ink/40 hover:text-ink"
                      >
                        Skip step
                      </button>
                    )}
                    {stepId === "profile" && (
                      <Button
                        type="button"
                        onClick={saveProfile}
                        disabled={uploadingProfile}
                        className="gap-1.5"
                      >
                        {uploadingProfile ? "Uploading…" : "Save & continue"}{" "}
                        <HiOutlineArrowRight size={14} />
                      </Button>
                    )}
                    {stepId === "categories" && (
                      <Button type="button" onClick={useCategories} className="gap-1.5">
                        Continue <HiOutlineArrowRight size={14} />
                      </Button>
                    )}
                    {stepId === "services" && (
                      <Button
                        type="button"
                        onClick={() => {
                          markComplete("services");
                          goNext();
                        }}
                        disabled={creatingService}
                        className="gap-1.5"
                      >
                        Continue <HiOutlineArrowRight size={14} />
                      </Button>
                    )}
                    {stepId === "staff" && (
                      <Button
                        type="button"
                        onClick={() => navigate("/admin")}
                        disabled={onboardingStaff}
                        className="gap-1.5"
                      >
                        Finish <HiOutlineArrowRight size={14} />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-ink/60">
          Need help? Check out the{" "}
          <Link to="/contact" className="text-forest font-medium hover:underline">
            contact page
          </Link>
        </p>
      </div>
    </div>
  );
}
