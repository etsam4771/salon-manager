import type { BusinessModel } from "../../types/gloable.types";
import type {
  AttendancePolicyRequest,
  ServiceCategory,
  ServiceCategoryCreateRequest,
  ServiceCreateRequest,
  StaffingOnboardRequest,
} from "../../types/onboarding";
import type { Branch } from "../../types/salon";
import type { AttendencePolicy, StaffProfile } from "../../types/tentant.types";
import type { ApiResponse } from "../../utils/response";
import api from "../axios";

/**
 * Endpoints backing the finalize-onboarding wizar. Paths mirror the
 * backend route mounts under /api/v1 — note the backend's own typo
 * "attendence-polilcy" is kept here on purpose.
 */
export const onboardingService = {
  getGlobalServiceCategories: async (): Promise<ApiResponse<ServiceCategory[]>> =>
    (await api.get<ApiResponse<ServiceCategory[]>>("/global/service-categories")).data,

  getTenantServiceCategories: async (): Promise<ApiResponse<ServiceCategory[]>> =>
    (await api.get<ApiResponse<ServiceCategory[]>>("/tenants/service-categories")).data,

  createServiceCategory: async (payload: ServiceCategoryCreateRequest): Promise<ApiResponse<null>> =>
    (await api.post<ApiResponse<null>>("/tenants/service-category", payload)).data,

  createService: async (payload: ServiceCreateRequest): Promise<ApiResponse<unknown>> =>
    (await api.post<ApiResponse<unknown>>("/services", payload)).data,

  getBusinessModels: async (): Promise<ApiResponse<BusinessModel[]>> =>
    (await api.get<ApiResponse<BusinessModel[]>>("/global/business-models")).data,

  getBranches: async (): Promise<ApiResponse<Branch[]>> =>
    (await api.get<ApiResponse<Branch[]>>("/branches")).data,

  createAttendancePolicy: async (payload: AttendancePolicyRequest): Promise<ApiResponse<AttendencePolicy>> =>
    (await api.post<ApiResponse<AttendencePolicy>>("/staff-onboard/attendence-polilcy", payload)).data,

  getAttendancePolicy: async (branchId: string): Promise<ApiResponse<AttendencePolicy>> =>
    (await api.get<ApiResponse<AttendencePolicy>>(`/staff-onboard/attendence-polilcy?branchId=${branchId}`)).data,

  onboardStaff: async (payload: StaffingOnboardRequest): Promise<ApiResponse<StaffProfile>> =>
    (await api.post<ApiResponse<StaffProfile>>("/staff-onboard", payload)).data,
};
