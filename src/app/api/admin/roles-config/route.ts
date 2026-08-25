import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getRolesConfig, setRolesConfig, type ServerRoleConfig } from '@/lib/server/roles-config';

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
  return NextResponse.json(getRolesConfig());
}

export async function PUT(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'فقط ادمین' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { roles?: ServerRoleConfig[] };
  if (!Array.isArray(body.roles) || body.roles.length === 0) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  setRolesConfig(body.roles);
  return NextResponse.json(getRolesConfig());
}
