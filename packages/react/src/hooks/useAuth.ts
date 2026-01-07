'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Authentication session data stored in localStorage
 */
export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  signallingUrl?: string;
  iceServers?: RTCIceServer[];
  user?: Record<string, unknown>;
}

/**
 * Login response from backend
 */
export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  signalling_url?: string;
  ice_servers?: RTCIceServer[];
  user?: Record<string, unknown>;
}

/**
 * Configuration for useAuth hook
 */
export interface UseAuthConfig {
  /**
   * Backend API URL for authentication
   * @default process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
   */
  apiUrl?: string;
  /**
   * Login endpoint path
   * @default '/auth/login'
   */
  loginPath?: string;
  /**
   * Storage key prefix for localStorage
   * @default 'adamo_'
   */
  storagePrefix?: string;
  /**
   * Callback when authentication state changes
   */
  onAuthChange?: (isAuthenticated: boolean) => void;
}

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication check is in progress */
  isLoading: boolean;
  /** Whether login is in progress */
  isLoggingIn: boolean;
  /** Current error message */
  error: string | null;
  /** Current session data */
  session: AuthSession | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  /** Logout and clear session */
  logout: () => void;
  /** Clear current error */
  clearError: () => void;
}

const DEFAULT_CONFIG: Required<Omit<UseAuthConfig, 'onAuthChange'>> = {
  apiUrl: typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:8000',
  loginPath: '/auth/login',
  storagePrefix: 'adamo_',
};

/**
 * Hook for managing authentication state
 *
 * Handles login, logout, session persistence in localStorage, and
 * automatic session restoration on mount.
 *
 * @example Basic usage
 * ```tsx
 * function LoginPage() {
 *   const { isAuthenticated, isLoggingIn, error, login, logout } = useAuth();
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *
 *   if (isAuthenticated) {
 *     return <button onClick={logout}>Logout</button>;
 *   }
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); login(email, password); }}>
 *       <input value={email} onChange={(e) => setEmail(e.target.value)} />
 *       <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 *       {error && <div>{error}</div>}
 *       <button disabled={isLoggingIn}>
 *         {isLoggingIn ? 'Logging in...' : 'Login'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example With custom API URL
 * ```tsx
 * const auth = useAuth({
 *   apiUrl: 'https://api.example.com',
 *   loginPath: '/api/auth/login',
 * });
 * ```
 */
export function useAuth(config: UseAuthConfig = {}): UseAuthReturn {
  const { apiUrl, loginPath, storagePrefix, onAuthChange } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);

  // Storage keys
  const keys = {
    accessToken: `${storagePrefix}access_token`,
    refreshToken: `${storagePrefix}refresh_token`,
    signallingUrl: `${storagePrefix}signalling_url`,
    iceServers: `${storagePrefix}ice_servers`,
    user: `${storagePrefix}user`,
  };

  // Load session from localStorage
  const loadSession = useCallback((): AuthSession | null => {
    if (typeof window === 'undefined') return null;

    const accessToken = localStorage.getItem(keys.accessToken);
    if (!accessToken) return null;

    const refreshToken = localStorage.getItem(keys.refreshToken) ?? undefined;
    const signallingUrl = localStorage.getItem(keys.signallingUrl) ?? undefined;

    let iceServers: RTCIceServer[] | undefined;
    const iceServersStr = localStorage.getItem(keys.iceServers);
    if (iceServersStr) {
      try {
        iceServers = JSON.parse(iceServersStr);
      } catch {}
    }

    let user: Record<string, unknown> | undefined;
    const userStr = localStorage.getItem(keys.user);
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {}
    }

    return { accessToken, refreshToken, signallingUrl, iceServers, user };
  }, [keys]);

  // Save session to localStorage
  const saveSession = useCallback((data: LoginResponse) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(keys.accessToken, data.access_token);

    if (data.refresh_token) {
      localStorage.setItem(keys.refreshToken, data.refresh_token);
    }
    if (data.signalling_url) {
      localStorage.setItem(keys.signallingUrl, data.signalling_url);
    }
    if (data.ice_servers) {
      localStorage.setItem(keys.iceServers, JSON.stringify(data.ice_servers));
    }
    if (data.user) {
      localStorage.setItem(keys.user, JSON.stringify(data.user));
    }
  }, [keys]);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(keys.accessToken);
    localStorage.removeItem(keys.refreshToken);
    localStorage.removeItem(keys.signallingUrl);
    localStorage.removeItem(keys.iceServers);
    localStorage.removeItem(keys.user);
  }, [keys]);

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = loadSession();
    if (existingSession) {
      setSession(existingSession);
      setIsAuthenticated(true);
      onAuthChange?.(true);
    }
    setIsLoading(false);
  }, [loadSession, onAuthChange]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      setError('Please enter email and password');
      return false;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}${loginPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Save to localStorage
      saveSession(data);

      // Update state
      const newSession: AuthSession = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        signallingUrl: data.signalling_url,
        iceServers: data.ice_servers,
        user: data.user,
      };
      setSession(newSession);
      setIsAuthenticated(true);
      onAuthChange?.(true);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [apiUrl, loginPath, saveSession, onAuthChange]);

  // Logout function
  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    setIsAuthenticated(false);
    setError(null);
    onAuthChange?.(false);
  }, [clearSession, onAuthChange]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    isLoggingIn,
    error,
    session,
    login,
    logout,
    clearError,
  };
}

export default useAuth;
