import { LoginForm } from './login-form';

export default function LoginPage() {
  return <LoginForm demoAuth={process.env.DEMO_AUTH === 'true'} />;
}
