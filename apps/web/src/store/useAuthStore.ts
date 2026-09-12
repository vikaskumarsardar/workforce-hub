import { create } from 'zustand';

export interface UserProfile {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Array<'ADMIN' | 'HR_MANAGER' | 'LINE_MANAGER' | 'EMPLOYEE'>;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  tenantId: string | null;
  user: UserProfile | null;
  activeRole: 'ADMIN' | 'HR_MANAGER' | 'LINE_MANAGER' | 'EMPLOYEE' | null;
  isAuthenticated: boolean;

  setAuth: (payload: { accessToken: string; refreshToken: string; user: UserProfile }) => void;
  setTenantId: (tenantId: string) => void;
  setActiveRole: (role: 'ADMIN' | 'HR_MANAGER' | 'LINE_MANAGER' | 'EMPLOYEE') => void;
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
    const defaultRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'EMPLOYEE';
    set({
      accessToken,
      refreshToken,
      tenantId: user.tenantId,
      user,
      activeRole: defaultRole,
      isAuthenticated: true,
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tenantId', user.tenantId);
    }
  },

  setTenantId: (tenantId: string) => {
    set({ tenantId });
    if (typeof window !== 'undefined') {
      localStorage.setItem('tenantId', tenantId);
    }
  },

  setActiveRole: (activeRole) => {
    set({ activeRole });
  },

  setAccessToken: (accessToken: string) => {
    set({ accessToken });
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tenantId');
    }
  },
}));
