
export interface ApiResponse<T = null> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    pagination?: Pagination;
}
interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
};

export interface ApiError<T = null> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
}