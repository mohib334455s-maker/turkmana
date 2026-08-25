import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { listActivePresence } from '@/lib/server/presence';

async function requireAdmin() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'فقط ادمین' }, { status: 403 });
  }

  const sessions = listActivePresence();
  return NextResponse.json({
    count: sessions.length,
    sessions,
    usingDatabase: Boolean(process.env.DATABASE_URL && process.env.DEMO_AUTH !== 'true'),
  });
}

export async function POST() {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
  }
  const payload = verifyToken(token);
  if (!payload?.sessionId) {
    return NextResponse.json({ ok: true });
  }

  const { touchPresence } = await import('@/lib/server/presence');
  touchPresence(payload.sessionId);
  return NextResponse.json({ ok: true });
}
