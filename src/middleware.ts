import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { checkNetworkAccess, getClientIp } from '@/lib/network-access';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyAuthToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as {
      userId?: number;
      email?: string;
      role?: string;
      companyAccess?: string;
      sessionId?: string;
      companyNetworkOnly?: boolean;
      blockMobile?: boolean;
      allowedCidrs?: string[];
    };
  } catch {
    return null;
  }
}

function networkBlockResponse(request: NextRequest, reason: 'mobile' | 'network') {
  const message = reason === 'mobile' ? 'mobile_blocked' : 'network_blocked';
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: message }, { status: 403 });
  }
  const url = new URL('/login', request.url);
  url.searchParams.set('reason', message);
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth-token');
  return response;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth/login') ||
    pathname === '/api/health'
  ) {
    if (pathname.startsWith('/login') && token) {
      const payload = await verifyAuthToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

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

    const role = payload.role ?? 'user';
    if (role !== 'admin' && (payload.companyNetworkOnly || payload.blockMobile)) {
      const ip = getClientIp(request);
      const userAgent = request.headers.get('user-agent') ?? '';
      const net = checkNetworkAccess({
        ip,
        userAgent,
        policy: {
          companyNetworkOnly: payload.companyNetworkOnly,
          blockMobile: payload.blockMobile,
          allowedCidrs: payload.allowedCidrs,
        },
      });
      if (!net.ok) {
        return networkBlockResponse(request, net.reason);
      }
    }

    if (pathname.startsWith('/api/admin/') && role !== 'admin') {
      return NextResponse.json({ error: 'فقط ادمین' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*', '/login'],
};
