'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AUTH_ENDPOINTS, APP_ROUTES, USER_ROLES } from '@/lib/constants';
import { Building, Mail, Lock, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [tenantId, setTenantId] = useState('acme-corp');
  const [email, setEmail] = useState('admin@acme.com');
  const [password, setPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        tenantId,
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data.data || response.data;
      setAuth({ accessToken, refreshToken, user });
      router.push(APP_ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const axiosError = err as { code?: string; response?: { status?: number; data?: { message?: string } } };
      // Fallback for development if backend server is not running locally
      const isDevFallback = process.env.NODE_ENV === 'development';
      if (isDevFallback && (axiosError.code === 'ERR_NETWORK' || axiosError.response?.status === 404)) {
        setAuth({
          accessToken: 'mock-dev-jwt-token-access',
          refreshToken: 'mock-dev-jwt-token-refresh',
          user: {
            id: 'usr-dev-admin',
            tenantId: tenantId || 'acme-corp',
            email: email || 'admin@acme.com',
            firstName: 'Sarah',
            lastName: 'Jenkins',
            roles: [USER_ROLES.ADMIN, USER_ROLES.HR_MANAGER, USER_ROLES.LINE_MANAGER, USER_ROLES.EMPLOYEE],
          },
        });
        router.push(APP_ROUTES.DASHBOARD);
        return;
      }

      const message = axiosError.response?.data?.message || 'Invalid tenant domain or authentication credentials.';
      setErrorMessage(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xl shadow-indigo-600/30">
              WP
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-100">
              Workforce<span className="text-indigo-400">Pulse</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Sign in to access your Enterprise Multi-Tenant Workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-3xl p-8 border border-slate-700/80 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" aria-hidden="true" /> Portal Authentication
            </h1>
            <Badge variant="indigo" size="sm">B2B SaaS</Badge>
          </div>

          {errorMessage && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Tenant Domain Identifier"
              placeholder="e.g. acme-corp"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              leftIcon={<Building className="w-4 h-4" />}
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
            >
              Authenticate & Sign In
            </Button>
          </form>

          {/* Registration Link */}
          <div className="pt-4 text-center border-t border-slate-800 text-xs text-slate-400">
            Need to register a new B2B client company?{' '}
            <Link href={APP_ROUTES.REGISTER_TENANT} className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Register Tenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
