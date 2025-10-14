// Auth & Users
export * from './auth';

// Organization
export * from './organization';

// Projects, Boards, Tasks
export * from './project';

// Common types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
