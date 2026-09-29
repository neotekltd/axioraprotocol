import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Register',
  description: 'Create your Axiora Protocol account. Email verification required.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
