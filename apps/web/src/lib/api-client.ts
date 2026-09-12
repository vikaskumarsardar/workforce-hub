import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { HTTP_STATUS, HTTP_HEADERS, STORAGE_KEYS, AUTH_ENDPOINTS } from '@/lib/constants';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    [HTTP_HEADERS.CONTENT_TYPE]: 'application/json',
  },
});

// Request Interceptor: Inject Authorization Bearer token & x-tenant-id
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token = useAuthStore.getState().accessToken;
    let tenantId = useAuthStore.getState().tenantId;

    if (typeof window !== 'undefined') {
      token = token || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      tenantId = tenantId || localStorage.getItem(STORAGE_KEYS.TENANT_ID);
    }

    if (token && config.headers) {
      config.headers[HTTP_HEADERS.AUTHORIZATION] = `${HTTP_HEADERS.BEARER}${token}`;
    }

    if (tenantId && config.headers) {
      config.headers[HTTP_HEADERS.TENANT_ID] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Auto-Refresh 401 Unauthorized tokens
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === HTTP_STATUS.UNAUTHORIZED;
    const isAlreadyRetried = Boolean(originalRequest?._retry);
    const isLoginEndpoint = Boolean(originalRequest?.url?.includes(AUTH_ENDPOINTS.LOGIN));
    const isAuthRefreshEndpoint = Boolean(originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH));

    const shouldRefreshToken = isUnauthorized && !isAlreadyRetried && !isLoginEndpoint && !isAuthRefreshEndpoint;

    if (shouldRefreshToken) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers[HTTP_HEADERS.AUTHORIZATION] = `${HTTP_HEADERS.BEARER}${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        useAuthStore.getState().refreshToken ||
        (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null);

      if (!refreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, { refreshToken });
        const newAccessToken = data.accessToken || data.data?.accessToken;

        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          originalRequest.headers[HTTP_HEADERS.AUTHORIZATION] = `${HTTP_HEADERS.BEARER}${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
