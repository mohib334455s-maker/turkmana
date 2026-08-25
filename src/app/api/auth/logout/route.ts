import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { removePresence } from '@/lib/server/presence';

export async function POST() {
  const token = (await cookies()).get('auth-token')?.value;
  if (token) {
    const payload = verifyToken(token);
    if (payload?.sessionId) removePresence(payload.sessionId);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth-token');
  return response;
}
