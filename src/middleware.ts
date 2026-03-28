import { NextRequest, NextResponse } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';

export async function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('better-auth.session_token');
  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate session via Better Auth API
  try {
    const { data: session } = await betterFetch<{
      user: { id: string; role?: string; banned?: boolean };
    }>('/api/auth/get-session', {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    });

    if (!session?.user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session.user.banned) {
      return NextResponse.redirect(new URL('/?banned=1', request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
