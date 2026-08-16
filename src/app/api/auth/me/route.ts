import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 401 });
    }

    if (process.env.DEMO_AUTH === 'true') {
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          fullName:
            payload.userId === 1
              ? 'مدیر سیستم'
              : payload.email,
          role: payload.role ?? 'user',
          companyAccess: payload.companyAccess ?? (payload.role === 'admin' ? 'both' : 'arya'),
        },
      });
    }

    try {
      const { db } = await import('@/db');
      const { users } = await import('@/db/schema');
      const { eq } = await import('drizzle-orm');

      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
      });

      if (!user || !user.isActive) {
        return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          companyAccess: (user as { companyAccess?: string }).companyAccess,
        },
      });
    } catch {
      return NextResponse.json({
        user: {
          id: payload.userId,
          email: payload.email,
          fullName: payload.email,
          role: payload.role ?? 'user',
          companyAccess: payload.companyAccess ?? 'arya',
        },
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات کاربر' },
      { status: 500 }
    );
  }
}
