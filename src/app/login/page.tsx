import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'ورود | ترکمن ERP',
};

export default function LoginPage() {
  return <LoginForm demoAuth={process.env.DEMO_AUTH === 'true'} />;
}
