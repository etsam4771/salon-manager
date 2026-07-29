import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/auth";
import type { ApiResponse } from "../../utils/response";
import api from "../axios";
import { apiEndpoints } from "../endpoint";

export const authService = {
  login: async (creds: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(apiEndpoints.auth.login, creds);
    const { token, user } = response.data;

    // Persist the token so the axios request interceptor can attach it —
    // this step was previously missing, so every authenticated request
    // after login/register failed silently (no Authorization header).
    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  register: async (creds: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(apiEndpoints.auth.register, creds);
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem("token", token);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
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
