import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAuthToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  // Public paths
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth/login')) {
    // Already logged in → go to dashboard
    if (pathname.startsWith('/login') && token) {
      const payload = await verifyAuthToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // API health check
  if (pathname === '/api/health') {
    return NextResponse.next();
  }

  // Protected paths
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyAuthToken(token);
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/login',
  ],
};
