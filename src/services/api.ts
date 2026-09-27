/**
 * Unified API Client - Capacitor & Web Ready
 * 
 * Provides centralized HTTP handling, base URL resolution,
 * automatic header injection, and standardized error parsing.
 * Allows mobile apps (Capacitor) to communicate seamlessly with the remote backend
 * by configuring VITE_API_BASE_URL.
 */

import { storageService } from './storage';

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    // In web browser dev/prod, relative paths '/api/...' work directly with same-origin or Vite proxy.
    // In native Capacitor (iOS/Android), the webview is hosted at capacitor://localhost,
    // so VITE_API_BASE_URL (e.g. 'https://spiceshahi.in') points requests to the live backend.
    const envBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || '';
    this.baseUrl = envBase.replace(/\/+$/, '');
  }

  setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private resolveUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return this.baseUrl ? `${this.baseUrl}${cleanPath}` : cleanPath;
  }

  private getDefaultHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    // If Authorization is not explicitly set, auto-inject customer token if present
    if (!headers['Authorization']) {
      const customerToken = storageService.getAuthToken();
      if (customerToken) {
        headers['Authorization'] = `Bearer ${customerToken}`;
      }
    }

    return headers;
  }

  async request<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      token?: string | null;
    } = {}
  ): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(path);
    const headers = this.getDefaultHeaders(options.headers);

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    try {
      const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers,
      };

      if (options.body !== undefined && options.method !== 'GET') {
        fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      }

      const res = await fetch(url, fetchOptions);

      // Handle non-JSON responses (like PDF or text)
      const contentType = res.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        data = await res.text();
      }

      if (!res.ok) {
        const errorMsg =
          (data && typeof data === 'object' && (data.error || data.message)) ||
          `Request failed with status ${res.status}`;
        return {
          ok: false,
          status: res.status,
          error: errorMsg,
          data,
        };
      }

      return {
        ok: true,
        status: res.status,
        data,
      };
    } catch (err: any) {
      console.error(`[API] Network error on ${options.method || 'GET'} ${url}:`, err);
      return {
        ok: false,
        status: 0,
        error: err?.message || 'Network connection failed. Please check your internet connection.',
      };
    }
  }

  get<T = any>(path: string, options?: { headers?: Record<string, string>; token?: string | null }) {
    return this.request<T>(path, { method: 'GET', ...options });
  }

  post<T = any>(path: string, body?: any, options?: { headers?: Record<string, string>; token?: string | null }) {
    return this.request<T>(path, { method: 'POST', body, ...options });
  }

  put<T = any>(path: string, body?: any, options?: { headers?: Record<string, string>; token?: string | null }) {
    return this.request<T>(path, { method: 'PUT', body, ...options });
  }

  patch<T = any>(path: string, body?: any, options?: { headers?: Record<string, string>; token?: string | null }) {
    return this.request<T>(path, { method: 'PATCH', body, ...options });
  }

  delete<T = any>(path: string, options?: { headers?: Record<string, string>; token?: string | null }) {
    return this.request<T>(path, { method: 'DELETE', ...options });
  }
}

export const apiClient = new ApiClient();
