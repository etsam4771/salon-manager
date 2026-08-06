import type { OnboardRequestBody } from "../../pages/OnboardSalonPage";
import type { BusinessModel } from "../../types/gloable.types";
import type { ApiResponse } from "../../utils/response";
import api from "../axios";

export const gloabalApiService = {
  businessModel: async (): Promise<ApiResponse<BusinessModel[]>> => {
    const response = await api.get<ApiResponse<BusinessModel[]>>("/global/business-models");
    console.log(response);
    return response.data;
  },
  businessOnboard: async (onboardingData: OnboardRequestBody): Promise<ApiResponse<void>> => {
    const result = await api.post<ApiResponse<void>>("/global/onboard-business", onboardingData);
    return result.data;
  }
}
