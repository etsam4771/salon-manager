// Finalize-onboarding DTOs — mirror the backend controllers the finalize
// wizard talks to: global.routes (global categories), tenants.controller
// (tenant service categories), services.controller (service creation),
// staff-onboard.controller (attendance policy + staff onboarding).
import type { EmploymentStatus, EmploymentType, UserRole } from "./salon";

export type TaxRegime = "old_regime" | "new_regime" | "not_applicable";

export interface ServiceCategory {
  id: number;
  tenantId: string | null;
  subtypeId: number | null;
  name: string;
}

export interface ServiceCategoryCreateRequest {
  subtypeId: number;
  name: string;
}

export interface ServiceCategoryUpdateRequest {
  name?: string;
  subtypeId?: number;
}

export interface RequestServiceVariation {
  id?: number;
  name: string;
  priceModifier: number;
  durationModifier: number;
}

export interface RequestVariationGroup {
  id?: number;
  name: string;
  selectionType: "single" | "multiple";
  serviceVariations: RequestServiceVariation[];
}

export interface ServiceCreateRequest {
  businessModelId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  displayPrice: number;
  durationMins: number;
  variations?: RequestVariationGroup[];
}

export interface AttendancePolicyRequest {
  branchId: string;
  isEnabled?: boolean;
  trackDailyAttendance?: boolean;
  shiftManagementEnabled?: boolean;
  clockInOutEnabled?: boolean;
  breakTimeEnabled?: boolean;
  lateArrivalTrackingEnabled?: boolean;
  earlyLeavingTrackingEnabled?: boolean;
  overtimeTrackingEnabled?: boolean;
  leaveTrackingEnabled?: boolean;
  holidayCalendarEnabled?: boolean;
  graceMinutesLate?: number;
  graceMinutesEarly?: number;
  standardWorkMins?: number;
  overtimeThresholdMins?: number;
}

export interface StaffingOnboardRequest {
  branchId: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  employeeCode?: string;
  designation?: string;
  skills: string[];
  commissionPct: number;
  joinedOn: Date | string;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  reportingManagerId?: string;
  baseSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  weeklyHoursTarget: number;
  dateOfBirth?: Date | string;
  gender?: string;
  maritalStatus?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  bankBranch?: string;
  taxRegime?: TaxRegime;
  pfApplicable?: boolean;
  esiApplicable?: boolean;
  ptApplicable?: boolean;
  tdsApplicable?: boolean;
  pfNumber?: string;
  esiNumber?: string;
  uanNumber?: string;
  taxExemptionAmount?: number;
}

export interface BranchSummary {
  id: string;
  tenantId: string;
  name: string;
  branchCode?: string;
  city?: string;
  region?: string;
  isActive: boolean;
}
