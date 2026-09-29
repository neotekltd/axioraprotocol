'use client';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  disabled,
  invalid,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const digits = value.padEnd(LENGTH, '').slice(0, LENGTH).split('');

  const setCode = (code: string) => onChange(code.replace(/\D/g, '').slice(0, LENGTH));

  const focus = (i: number) => {
    const clamped = Math.max(0, Math.min(LENGTH - 1, i));
    refs.current[clamped]?.focus();
    setActive(clamped);
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-2.5" role="group" aria-label="6-digit verification code">
      {Array.from({ length: LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          value={digits[i] ?? ''}
          onFocus={() => setActive(i)}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, '').slice(-1);
            if (!d) {
              setCode(value.slice(0, i) + value.slice(i + 1));
              return;
            }
            setCode(value.slice(0, i) + d + value.slice(i + 1));
            if (i < LENGTH - 1) focus(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) focus(i - 1);
            if (e.key === 'ArrowLeft') focus(i - 1);
            if (e.key === 'ArrowRight') focus(i + 1);
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData('text');
            if (/\d{6}/.test(pasted.replace(/\D/g, ''))) {
              setCode(pasted);
              focus(LENGTH - 1);
            }
          }}
          className={cn(
            'h-[52px] w-11 rounded-[14px] border bg-[#151D2C] text-center font-mono text-xl text-white outline-none transition-colors sm:h-14 sm:w-[52px]',
            active === i && !disabled ? 'border-[#2FD6FF] shadow-[0_0_0_2px_rgba(47,214,255,0.12)]' : 'border-[#4B5C73]',
            invalid ? 'border-[#F06B78]' : '',
            disabled ? 'opacity-50' : ''
          )}
        />
      ))}
    </div>
  );
}
