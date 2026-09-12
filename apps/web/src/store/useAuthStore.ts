import { create } from 'zustand';
import { STORAGE_KEYS, USER_ROLES, UserRole } from '@/lib/constants';

export interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  user: UserProfile | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;

  setAuth: (payload: { accessToken: string; refreshToken: string; user: UserProfile }) => void;
  setTenantId: (tenantId: string) => void;
  setActiveRole: (role: UserRole) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  tenantId: null,
  user: null,
  activeRole: null,
  isAuthenticated: false,

  setAuth: ({ accessToken, refreshToken, user }) => {
    const defaultRole = user.roles && user.roles.length > 0 ? user.roles[0] : USER_ROLES.EMPLOYEE;
    set({
      accessToken,
      refreshToken,
      tenantId: user.tenantId,
      user,
      activeRole: defaultRole,
      isAuthenticated: true,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, user.tenantId);
    }
  },

  setTenantId: (tenantId: string) => {
    set({ tenantId });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TENANT_ID, tenantId);
    }
  },

  setActiveRole: (activeRole) => {
    set({ activeRole });
  },

  setAccessToken: (accessToken: string) => {
    set({ accessToken });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
  },

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
      tenantId: null,
      user: null,
      activeRole: null,
      isAuthenticated: false,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TENANT_ID);
    }
  },
}));
