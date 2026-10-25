export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  message?: string | null;
  page?: Page;
}

interface Page {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}
