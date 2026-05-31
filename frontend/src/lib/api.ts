import toast from 'react-hot-toast';

const SESSION_EXPIRED_EVENT = 'session-expired';

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
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('accessToken');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private async attemptRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.success && data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<ApiSuccess<T>> {
    const execute = async (): Promise<ApiSuccess<T>> => {
      const res = await fetch(`${this.baseUrl}${url}`, {
        method,
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      let data: ApiResponse<T>;
      try {
        data = await res.json() as ApiResponse<T>;
      } catch {
        const text = await res.text().catch(() => '');
        throw new Error(`Server returned ${res.status}${text ? ': ' + text.slice(0, 200) : ' with empty body'}`);
      }

      if (!res.ok && res.status === 401) {
        const refreshed = await this.attemptRefresh();
        if (refreshed) {
          const retryRes = await fetch(`${this.baseUrl}${url}`, {
            method,
            headers: this.getHeaders(),
            body: body ? JSON.stringify(body) : undefined,
            credentials: 'include',
          });
          const retryData = await retryRes.json() as ApiResponse<T>;
          if (!retryData.success) {
            localStorage.removeItem('accessToken');
            window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
            throw new Error((retryData as ApiError).error || 'Session expired');
          }
          return retryData as ApiSuccess<T>;
        }
        localStorage.removeItem('accessToken');
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        throw new Error('Session expired');
      }

      if (!data.success) {
        const errMsg = (data as ApiError).error || 'Request failed';
        throw new Error(errMsg);
      }

      return data as ApiSuccess<T>;
    };

    try {
      return await execute();
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Session expired')) {
        toast.error(error.message);
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
