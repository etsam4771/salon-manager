import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/auth";
import type { ApiResponse } from "../../utils/response";
import api from "../axios";
import { apiEndpoints } from "../endpoint";

export const authService = {
    login: async (creds: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>(apiEndpoints.auth.login, creds);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    register: async (creds: RegisterCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>(apiEndpoints.auth.register, creds);
        console.log(response);
        return response.data;
    },
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        return (await api.get<ApiResponse<User>>(apiEndpoints.user.get)).data
    },
    logout: async (creds: RegisterCredentials): Promise<ApiResponse<void>> => {
        const response = await api.post<ApiResponse<void>>(apiEndpoints.auth.login, creds);
        return response.data;
    },
}

