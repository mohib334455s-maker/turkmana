import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyPassword } from '@/lib/auth';

const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'مدیر سیستم',
    role: 'admin',
    companyAccess: 'both',
  },
  {
    id: 2,
    email: 'arya@example.com',
    password: 'arya123',
    fullName: 'کاربر آریا',
    role: 'manager',
    companyAccess: 'arya',
  },
  {
    id: 3,
    email: 'turkmen@example.com',
    password: 'turkmen123',
    fullName: 'کاربر ترکمن',
    role: 'manager',
    companyAccess: 'turkmen',
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

    if (!email || !password) {
      return NextResponse.json(
        { error: 'ایمیل و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    // Demo mode: skip Postgres entirely (local/dev without DB)
    if (process.env.DEMO_AUTH === 'true') {
      const demo = DEMO_USERS.find((u) => u.email === email && u.password === password);
      if (demo) {
        return loginSuccessResponse(demo);
      }
      return NextResponse.json(
        { error: 'ایمیل یا رمز عبور نادرست است' },
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
          { error: 'ایمیل یا رمز عبور نادرست است' },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'ایمیل یا رمز عبور نادرست است' },
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
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس. DEMO_AUTH را فعال کنید یا Postgres را راه‌اندازی کنید.' },
        { status: 503 }
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
