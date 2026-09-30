'use client';

// Axiora buttons + inputs. Primary: bright cyan, dark text, 52–58px tall on
// mobile. Secondary: dark surface + subtle border. Inputs: dark navy fill,
// cyan focus ring. No browser-default validation visuals.

import { useState, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AxButton({
  children, variant = 'primary', className = '', ...rest
}: {
  children: ReactNode; variant?: 'primary' | 'secondary';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        'flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold transition active:scale-[0.99] disabled:opacity-60',
        variant === 'primary'
          ? 'bg-[#2FD6FF] text-[#06121A] shadow-[0_0_28px_rgba(47,214,255,0.25)] hover:brightness-110'
          : 'border border-[#2A394D] bg-[#111722] text-[#F1F5FA] hover:border-[rgba(47,214,255,0.5)]',
        className
      )}
    >
      {children}
    </button>
  );
}

export function AxInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={cn(
        'w-full rounded-[16px] border border-[#4B5C73] bg-[#151D2C] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-[#596579]',
        'focus:border-[#2FD6FF] focus:shadow-[0_0_0_2px_rgba(47,214,255,0.12)]',
        className
      )}
    />
  );
}

export function AxPasswordInput({ label, ...rest }: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div>
      {label ? (
        <label className="mb-2 block text-[15px] text-[#AAB5C7]">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <AxInput {...rest} type={show ? 'text' : 'password'} className="pr-14" />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[12px] border border-[rgba(47,214,255,0.5)] p-2.5 text-[#AAB5C7] hover:text-white"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// Real 4-segment strength meter: length + character classes. No theater.
export function PasswordStrength({ password }: { password: string }) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  const label = password.length === 0 ? '' : score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  return (
    <div className="mt-2.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full', i < score ? 'bg-[#2FD6FF]' : 'bg-[#2A394D]')} />
        ))}
      </div>
      {label && <div className="mt-1.5 text-[13px] text-[#AAB5C7]">{label}</div>}
    </div>
  );
}

export function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="alert" className="mt-2 text-[13px] text-[#F06B78]">{message}</p>;
}

export function FieldSuccess({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="status" className="mt-2 text-[13px] text-[#35D98B]">{message}</p>;
}
