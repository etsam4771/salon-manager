import axios, { AxiosError, type AxiosResponse } from "axios";
import { CONFIG } from "../utils/constants";
import { apiEndpoints } from "./endpoint";
import type { ApiError, ApiResponse } from "../utils/response";

const api = axios.create({
    baseURL: `${CONFIG.API_URL+apiEndpoints.prefix}`,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor (e.g., attach JWT token)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// Response Interceptor (e.g., handle global errors like 401 Unauthorized)
api.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        response.data.statusCode = response.status;
        return response; // ✅ MUST return
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
        }

        const err = error as AxiosError<ApiError>;

        const apiErrorData: ApiError = {
            success: err.response?.data?.success ?? false,
            statusCode: err.response?.status ?? 500,
            message: err.response?.data?.message ?? err.message,
            data: err.response?.data?.data ?? null,
        };

        return Promise.reject(apiErrorData || error);
    }
)

export default api;