export interface ApiResponse<T = null> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError<T = null> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}