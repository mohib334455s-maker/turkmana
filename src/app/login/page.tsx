import type { Metadata } from 'next';
import { isDemoAuth } from '@/lib/demo-auth';
import { LoginForm } from './login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ورود | ترکمن ERP',
};

export default function LoginPage() {
  return <LoginForm demoAuth={isDemoAuth()} />;
}
