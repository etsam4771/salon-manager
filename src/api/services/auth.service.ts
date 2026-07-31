import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/auth";
import type { ApiResponse } from "../../utils/response";
import api from "../axios";
import { apiEndpoints } from "../endpoint";

export const authService = {
  login: async (creds: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(apiEndpoints.auth.login, creds);
    console.log(response);
    const { accessToken, refreshToken, user } = response.data.data;

    // Persist the token so the axios request interceptor can attach it —
    // this step was previously missing, so every authenticated request
    // after login/register failed silently (no Authorization header).
    accessToken != null ? localStorage.setItem("accessToken", accessToken) : null;
    refreshToken != null ? localStorage.setItem("refreshToken", refreshToken) : null;
    user != null ? localStorage.setItem("user", JSON.stringify(user)) : null;

    return response.data.data;
  },

  register: async (creds: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(apiEndpoints.auth.register, creds);
    const { accessToken, refreshToken, user } = response.data.data;

    accessToken != null ? localStorage.setItem("accessToken", accessToken) : null;
    refreshToken != null ? localStorage.setItem("refreshToken", refreshToken) : null;
    user != null ? localStorage.setItem("user", JSON.stringify(user)) : null;

    return response.data.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return (await api.get<ApiResponse<User>>(apiEndpoints.user.get)).data;
  },

  logout: async (): Promise<void> => {
    try {
      // Was previously calling apiEndpoints.auth.login (wrong endpoint) and
      // required a RegisterCredentials body neither the caller had nor a
      // logout call needs.
      await api.post<ApiResponse<void>>(apiEndpoints.auth.logout);
    } finally {
      // Clear local session regardless of whether the server call succeeds,
      // so the user is never stuck "logged in" on the client after clicking logout.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};
