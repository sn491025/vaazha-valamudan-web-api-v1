export interface ApiSuccessResponse<T = any> {
  statusCode: number;
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  data: {
    error: string;
    message: string | string[];
    details?: any;
    timestamp: string;
    path?: string;
  };
}

export interface ValidationErrorDetail {
  field: string;
  value: any;
  constraints: string[];
}
