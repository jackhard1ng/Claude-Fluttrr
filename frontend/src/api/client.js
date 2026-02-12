import axios from 'axios';

/**
 * Base API URL. In development the CRA proxy handles forwarding
 * to the backend, so we just use a relative path.
 */
const BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';
const TOKEN_KEY = 'fluttrr_token';

/**
 * Configured Axios instance for all API communication.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor -- attach auth token
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token !== 'demo-token') {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Development request logging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        config.params || ''
      );
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Request error:', error);
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response interceptor -- handle errors globally
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    // Development response logging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        response.data ? '(data received)' : ''
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (process.env.NODE_ENV === 'development') {
      console.error(
        `[API] Error ${error.response?.status || 'NETWORK'}:`,
        error.response?.data?.message || error.message
      );
    }

    // Handle 401 Unauthorized -- attempt token refresh once
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('fluttrr_refresh_token');
      if (refreshToken && refreshToken !== 'demo-refresh-token') {
        try {
          const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { token } = refreshResponse.data.data || refreshResponse.data;
          if (token) {
            localStorage.setItem(TOKEN_KEY, token);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed -- clear auth
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('fluttrr_refresh_token');
          localStorage.removeItem('fluttrr_user');

          // Redirect to login if not already there
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('[API] Access forbidden:', originalRequest.url);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn('[API] Resource not found:', originalRequest.url);
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      console.warn('[API] Rate limited. Retry after:', error.response.headers['retry-after']);
    }

    // Handle 500+ Server Errors
    if (error.response?.status >= 500) {
      console.error('[API] Server error:', error.response?.data?.message || 'Internal server error');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
