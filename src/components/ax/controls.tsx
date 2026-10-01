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

// Compact technical icon button: 44px hit area, visible icon can be smaller.
export function AxIconButton({ children, label, className = '', ...rest }: {
  children: ReactNode; label: string; className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      {...rest}
      className={cn(
        'grid h-11 w-11 shrink-0 place-items-center rounded-[12px] border border-[#2A394D] text-[#AAB5C7] transition hover:border-[rgba(47,214,255,0.5)] hover:text-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2FD6FF]',
        className
      )}
    >
      {children}
    </button>
  );
}

export function AxSelect({ label, id, children, className = '', ...rest }: {
  label?: string; id: string; children: ReactNode; className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-2 block text-[15px] text-[#AAB5C7]">{label}</label>}
      <select
        id={id}
        {...rest}
        className="w-full rounded-[12px] border border-[#4B5C73] bg-[#151D2C] px-4 text-[15px] text-white outline-none transition focus:border-[#2FD6FF] focus:shadow-[0_0_0_2px_rgba(47,214,255,0.12)]"
        style={{ minHeight: 56 }}
      >
        {children}
      </select>
    </div>
  );
}

export function AxTextarea({ label, id, className = '', ...rest }: {
  label?: string; id: string; className?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="mb-2 block text-[15px] text-[#AAB5C7]">{label}</label>}
      <textarea
        id={id}
        {...rest}
        className="w-full rounded-[12px] border border-[#4B5C73] bg-[#151D2C] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-[#596579] focus:border-[#2FD6FF] focus:shadow-[0_0_0_2px_rgba(47,214,255,0.12)]"
      />
    </div>
  );
}

// Generic pill (status-adjacent, non-status): monospace, compact.
export function AxPill({ tone = 'muted', children }: {
  tone?: 'cyan' | 'green' | 'amber' | 'muted';
  children: ReactNode;
}) {
  const cls =
    tone === 'cyan'
      ? 'border-[rgba(47,214,255,0.45)] bg-[rgba(47,214,255,0.08)] text-[#2FD6FF]'
      : tone === 'green'
        ? 'border-[rgba(53,217,139,0.4)] bg-[rgba(53,217,139,0.08)] text-[#35D98B]'
        : tone === 'amber'
          ? 'border-[rgba(242,191,74,0.4)] bg-[rgba(242,191,74,0.08)] text-[#F2BF4A]'
          : 'border-[#2A394D] bg-[#111722] text-[#AAB5C7]';
  return (
    <span className={cn('inline-flex min-h-[30px] items-center rounded-full border px-3 font-mono text-[11px] font-semibold', cls)}>
      {children}
    </span>
  );
}

// Non-blocking inline confirmation (never a browser alert, never fullscreen).
export function AxToast({ message, tone = 'green' }: { message: string | null; tone?: 'green' | 'amber' }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={cn(
        'mt-3 rounded-[12px] border px-4 py-3 text-[13px]',
        tone === 'green'
          ? 'border-[rgba(53,217,139,0.35)] bg-[rgba(53,217,139,0.07)] text-[#35D98B]'
          : 'border-[rgba(242,191,74,0.35)] bg-[rgba(242,191,74,0.07)] text-[#F2BF4A]'
      )}
    >
      {message}
    </p>
  );
}

// Compact technical skeleton for loading states.
export function AxLoadingState({ lines = 3, label = 'Loading' }: { lines?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="space-y-2.5 rounded-[20px] border border-[#202A3A] bg-[#0D111A] p-5">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="anim-chip h-4 rounded-md bg-[#1A2334]"
          style={{ width: `${88 - i * 12}%`, animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </div>
  );
}
