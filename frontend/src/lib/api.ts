import { translations } from './i18n/translations';

type Language = 'en' | 'hi' | 'bn' | 'es' | 'pt' | 'fr' | 'de' | 'ar' | 'ja' | 'zh';

function apiT(key: string): string {
  let lang: Language = 'en';
  try { const raw = localStorage.getItem('lang'); if (raw) lang = JSON.parse(raw) as Language; } catch { /* fall back to en */ }
  const val = translations[lang]?.[key] || translations.en?.[key];
  return typeof val === 'string' ? val : key;
}

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
    return { 'Content-Type': 'application/json' };
  }

  private getCookie(name: string): string | undefined {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    if (match && match[2]) return decodeURIComponent(match[2]);
    return undefined;
  }

  private async attemptRefresh(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const csrfToken = this.getCookie('csrf-token');
        const headers: { [key: string]: string } = { 'Content-Type': 'application/json' };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
        const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers,
        });
        return res.ok;
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
          let retryData: ApiResponse<T>;
          try {
            retryData = await retryRes.json() as ApiResponse<T>;
          } catch {
            throw new Error(apiT('errors.tokenRefresh'));
          }
          if (!retryData.success) {
            window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
            throw new Error((retryData as ApiError).error || apiT('errors.sessionExpired'));
          }
          return retryData as ApiSuccess<T>;
        }
        window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
        throw new Error(apiT('errors.sessionExpired'));
      }

      if (!data.success) {
        const errMsg = (data as ApiError).error || apiT('errors.requestFailed');
        const err = new Error(errMsg);
        (err as any).status = res.status;
        throw err;
      }

      return data as ApiSuccess<T>;
    };

    return execute();
  }

  get<T>(url: string) { return this.request<T>('GET', url); }
  post<T>(url: string, body?: unknown) { return this.request<T>('POST', url, body); }
  put<T>(url: string, body?: unknown) { return this.request<T>('PUT', url, body); }
  patch<T>(url: string, body?: unknown) { return this.request<T>('PATCH', url, body); }
  delete<T>(url: string) { return this.request<T>('DELETE', url); }
}

export const api = new ApiClient();
