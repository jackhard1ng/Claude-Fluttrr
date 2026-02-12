import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/client';

/**
 * Demo user used as a fallback when the API is unavailable.
 */
const DEMO_USER = {
  id: 'demo-user-id',
  username: 'demo_user',
  display_name: 'Demo User',
  email: 'demo@fluttrr.com',
  bio: 'Just exploring Fluttrr!',
  city: 'Austin',
  state: 'Texas',
  avatar_url: '/api/placeholder/150/150',
  account_type: 'user',
  interests: ['coffee', 'trivia', 'live_music', 'food', 'fitness', 'art'],
  follower_count: 42,
  following_count: 67,
  events_attended_count: 15,
  is_verified: true,
};

const TOKEN_KEY = 'fluttrr_token';
const REFRESH_TOKEN_KEY = 'fluttrr_refresh_token';
const USER_KEY = 'fluttrr_user';

const AuthContext = createContext(null);

/**
 * AuthProvider manages authentication state for the entire application.
 *
 * On mount it checks localStorage for an existing token and attempts to
 * validate it against the API. If the API is unreachable it falls back
 * to a demo user so the app remains functional for demonstration purposes.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Track whether we're using demo mode (API unavailable)
  const isDemoMode = useRef(false);

  /**
   * Persist token and user data to localStorage.
   */
  const persistAuth = useCallback((token, refreshToken, userData) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }, []);

  /**
   * Clear all persisted auth data.
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    isDemoMode.current = false;
  }, []);

  /**
   * Fall back to demo mode when the API is unavailable.
   */
  const activateDemoMode = useCallback(() => {
    isDemoMode.current = true;
    const demoToken = 'demo-token';
    persistAuth(demoToken, 'demo-refresh-token', DEMO_USER);
    setUser(DEMO_USER);
    setIsAuthenticated(true);
  }, [persistAuth]);

  /**
   * Attempt to load the current user session on mount.
   */
  const initializeAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedToken) {
      // No stored session -- activate demo mode for easy exploration
      activateDemoMode();
      setIsLoading(false);
      return;
    }

    // Attempt to validate the stored token by fetching the current user
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data.data || response.data;
      setUser(userData);
      setIsAuthenticated(true);
      persistAuth(storedToken, null, userData);
    } catch (error) {
      // If API is unreachable (network error) fall back to demo mode
      if (!error.response) {
        // Network error -- API unavailable
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setIsAuthenticated(true);
          } catch {
            activateDemoMode();
          }
        } else {
          activateDemoMode();
        }
      } else if (error.response?.status === 401) {
        // Token expired -- try refresh
        try {
          await refreshToken();
        } catch {
          clearAuth();
          activateDemoMode();
        }
      } else {
        clearAuth();
        activateDemoMode();
      }
    } finally {
      setIsLoading(false);
    }
  }, [activateDemoMode, clearAuth, persistAuth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  /**
   * Log in with email and password.
   */
  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setAuthError(null);

      try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, refresh_token, user: userData } = response.data.data || response.data;

        persistAuth(token, refresh_token, userData);
        setUser(userData);
        setIsAuthenticated(true);
        isDemoMode.current = false;

        return userData;
      } catch (error) {
        if (!error.response) {
          // API unavailable -- use demo mode
          activateDemoMode();
          return DEMO_USER;
        }
        const message =
          error.response?.data?.message || error.response?.data?.error || 'Login failed. Please check your credentials.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activateDemoMode, persistAuth]
  );

  /**
   * Register a new user account.
   */
  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      setAuthError(null);

      try {
        const response = await apiClient.post('/auth/register', userData);
        const { token, refresh_token, user: newUser } = response.data.data || response.data;

        persistAuth(token, refresh_token, newUser);
        setUser(newUser);
        setIsAuthenticated(true);
        isDemoMode.current = false;

        return newUser;
      } catch (error) {
        if (!error.response) {
          activateDemoMode();
          return DEMO_USER;
        }
        const message =
          error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.';
        setAuthError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [activateDemoMode, persistAuth]
  );

  /**
   * Log the user out.
   */
  const logout = useCallback(async () => {
    try {
      if (!isDemoMode.current) {
        await apiClient.post('/auth/logout');
      }
    } catch {
      // Ignore errors during logout -- we clear locally regardless
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  /**
   * Update the current user's profile.
   */
  const updateProfile = useCallback(
    async (data) => {
      setAuthError(null);

      if (isDemoMode.current) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        persistAuth(null, null, updatedUser);
        return updatedUser;
      }

      try {
        const response = await apiClient.put('/auth/profile', data);
        const updatedUser = response.data.data || response.data;
        setUser(updatedUser);
        persistAuth(null, null, updatedUser);
        return updatedUser;
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to update profile.';
        setAuthError(message);
        throw new Error(message);
      }
    },
    [user, persistAuth]
  );

  /**
   * Refresh the authentication token.
   */
  const refreshToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken || isDemoMode.current) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: storedRefreshToken,
      });
      const { token, refresh_token: newRefreshToken, user: userData } = response.data.data || response.data;

      persistAuth(token, newRefreshToken, userData);
      if (userData) {
        setUser(userData);
      }
      setIsAuthenticated(true);

      return token;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth, persistAuth]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    authError,
    isDemoMode: isDemoMode.current,
    login,
    register,
    logout,
    updateProfile,
    refreshToken,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context.
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
