/**
 * API Response wrapper for all backend responses
 */
export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Pagination wrapper for list responses
 */
export interface IPaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
