import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/lib/auth';
import { isDemoAuth } from '@/lib/demo-auth';

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

function loginSuccessResponse(user: {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  companyAccess?: string;
}) {
  const role = user.role ?? 'admin';
  const companyAccess = role === 'admin' ? 'both' : user.companyAccess ?? 'arya';
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role,
    companyAccess,
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
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const loginId = String(email ?? body.username ?? '').trim().toLowerCase();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }
    const demoUser = DEMO_USERS.find(
      (u) =>
        password === u.password &&
        (u.email.toLowerCase() === loginId || u.username.toLowerCase() === loginId)
    );

    if (isDemoAuth()) {
      if (demoUser) {
        return loginSuccessResponse(demoUser);
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
        where: eq(users.email, email),
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

      return loginSuccessResponse({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        companyAccess: (user as { companyAccess?: string }).companyAccess,
      });
    } catch (dbError) {
      console.error('Database login failed:', dbError);
      if (demoUser) {
        return loginSuccessResponse(demoUser);
      }
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نادرست است' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'خطا در ورود به سیستم' },
      { status: 500 }
    );
  }
}
