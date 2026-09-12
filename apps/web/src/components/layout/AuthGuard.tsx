'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { STORAGE_KEYS, APP_ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';

export interface AuthGuardProps {
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const { accessToken, tenantId, isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    // Client-side hydration from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID);
      const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (storedToken && storedTenantId && !isAuthenticated) {
        setAuth({
          accessToken: storedToken,
          refreshToken: storedRefreshToken || '',
          user: {
            id: 'usr-cached',
            tenantId: storedTenantId,
            email: 'admin@organization.com',
            firstName: 'Enterprise',
            lastName: 'User',
            roles: ['ADMIN', 'HR_MANAGER', 'LINE_MANAGER', 'EMPLOYEE'],
          },
        });
      }

      const hasValidToken = Boolean(accessToken || storedToken);
      const isPublicRoute = pathname === APP_ROUTES.LOGIN || pathname === APP_ROUTES.REGISTER_TENANT || pathname === APP_ROUTES.HOME;

      if (!hasValidToken && !isPublicRoute) {
        router.push(APP_ROUTES.LOGIN);
      }
    }
  }, [accessToken, tenantId, isAuthenticated, pathname, router, setAuth]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Authenticating Session...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
