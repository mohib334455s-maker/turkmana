import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { generateToken, verifyPassword } from '@/lib/auth';
import { isDemoAuth } from '@/lib/demo-auth';
import { checkNetworkAccess, getClientIp } from '@/lib/network-access';
import { upsertPresence } from '@/lib/server/presence';
import { resolveRolePolicy } from '@/lib/server/roles-config';

const DEMO_USERS = [
  {
    id: 1,
    username: 'turkman',
    email: 'turkman',
    password: 'aria1234',
    fullName: 'مدیر ترکمن',
    role: 'admin',
    companyAccess: 'both',
  },
];

function loginSuccessResponse(
  user: {
    id: number;
    email: string;
    fullName: string;
    role?: string;
    companyAccess?: string;
  },
  request: Request
) {
  const role = user.role ?? 'admin';
  const companyAccess = role === 'admin' ? 'both' : user.companyAccess ?? 'arya';
  const policy = resolveRolePolicy(role);
  const sessionId = randomUUID();
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') ?? '';

  upsertPresence({
    sessionId,
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role,
    ip,
    userAgent,
    loginAt: new Date().toISOString(),
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role,
    companyAccess,
    sessionId,
    companyNetworkOnly: role !== 'admin' && Boolean(policy?.companyNetworkOnly),
    blockMobile: role !== 'admin' && Boolean(policy?.blockMobile),
    allowedCidrs: policy?.allowedCidrs,
  });

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role,
      companyAccess,
    },
    token,
  });

  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

function networkDenied(reason: 'mobile' | 'network') {
  const message =
    reason === 'mobile'
      ? 'این نقش اجازه ورود از موبایل را ندارد — فقط از دستگاه شبکه شرکت استفاده کنید'
      : 'این نقش فقط از شبکه داخلی شرکت قابل استفاده است';
  return NextResponse.json({ error: message, reason }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      username?: string;
      password?: string;
    };
    const { email, password } = body;

    const emailValue = String(email ?? body.username ?? '').trim();
    const loginId = emailValue.toLowerCase();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') ?? '';

    const demoUser = DEMO_USERS.find(
      (u) =>
        password === u.password &&
        (u.email.toLowerCase() === loginId || u.username.toLowerCase() === loginId)
    );

    const checkUserNetwork = (role: string) => {
      const policy = resolveRolePolicy(role);
      if (!policy) return null;
      return checkNetworkAccess({
        ip,
        userAgent,
        policy: {
          companyNetworkOnly: policy.companyNetworkOnly,
          blockMobile: policy.blockMobile,
          allowedCidrs: policy.allowedCidrs,
        },
      });
    };

    if (isDemoAuth()) {
      if (demoUser) {
        const net = checkUserNetwork(demoUser.role);
        if (net && !net.ok) return networkDenied(net.reason);
        return loginSuccessResponse(demoUser, request);
      }
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نادرست است' },
        { status: 401 }
      );
    }

    try {
      const { db } = await import('@/db');
      const { users } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const user = await db.query.users.findFirst({
        where: eq(users.email, emailValue),
      });

      if (!user || !user.isActive) {
        return NextResponse.json(
          { error: 'نام کاربری یا رمز عبور نادرست است' },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'نام کاربری یا رمز عبور نادرست است' },
          { status: 401 }
        );
      }

      const role = user.role ?? 'user';
      const net = checkUserNetwork(role);
      if (net && !net.ok) return networkDenied(net.reason);

      return loginSuccessResponse(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyAccess: (user as { companyAccess?: string }).companyAccess,
        },
        request
      );
    } catch (dbError) {
      console.error('Database login failed:', dbError);
      if (demoUser) {
        const net = checkUserNetwork(demoUser.role);
        if (net && !net.ok) return networkDenied(net.reason);
        return loginSuccessResponse(demoUser, request);
      }
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نادرست است' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'خطا در ورود به سیستم' }, { status: 500 });
  }
}
