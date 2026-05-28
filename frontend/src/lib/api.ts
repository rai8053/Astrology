import toast from 'react-hot-toast';

interface ApiError {
  success: false;
  error: string;
  code?: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<ApiSuccess<T>> {
    try {
      const res = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      if (res.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        throw new Error('Session expired');
      }

      const data = await res.json() as ApiResponse<T>;

      if (!data.success) {
        const errMsg = (data as ApiError).error || 'Request failed';
        toast.error(errMsg);
        throw new Error(errMsg);
      }

      return data as ApiSuccess<T>;
    } catch (error) {
      if (error instanceof Error && error.message !== 'Session expired') {
        toast.error(error.message || 'Network error');
      }
      throw error;
    }
  }

  get<T>(url: string) { return this.request<T>('GET', url); }
  post<T>(url: string, body?: unknown) { return this.request<T>('POST', url, body); }
  put<T>(url: string, body?: unknown) { return this.request<T>('PUT', url, body); }
  patch<T>(url: string, body?: unknown) { return this.request<T>('PATCH', url, body); }
  delete<T>(url: string) { return this.request<T>('DELETE', url); }
}

export const api = new ApiClient();
