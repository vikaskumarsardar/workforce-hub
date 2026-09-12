import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APP_ROUTES, STORAGE_KEYS } from '@/lib/constants';

export function middleware(request: NextRequest) {
  const token = request.cookies.get(STORAGE_KEYS.ACCESS_TOKEN)?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname === APP_ROUTES.LOGIN ||
    pathname === APP_ROUTES.REGISTER_TENANT ||
    pathname === APP_ROUTES.HOME;

  // 1. Unauthenticated user accessing a protected route -> Redirect to Login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL(APP_ROUTES.LOGIN, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user visiting Login or Register -> Redirect to Dashboard
  if (token && (pathname === APP_ROUTES.LOGIN || pathname === APP_ROUTES.REGISTER_TENANT)) {
    const dashboardUrl = new URL(APP_ROUTES.DASHBOARD, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
