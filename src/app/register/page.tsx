import { RegisterForm } from '@/components/auth/RegisterForm';
import { TechGridBackground } from '@/components/ax/primitives';

export const metadata = {
  title: 'Register',
  description: 'Create your Axiora Protocol account. Email verification required.',
  alternates: { canonical: '/register' },
};

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen bg-[#080B12]">
      <TechGridBackground />
      <div className="relative">
        <RegisterForm />
      </div>
    </div>
  );
}
