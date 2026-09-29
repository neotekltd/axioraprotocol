import Image from 'next/image';
import { cn } from '@/lib/utils';

// Axiora brand mark. The artwork glows on black, so screen-blend removes
// the backdrop seamlessly on dark surfaces. Light surfaces: keep unblended.

export function AxioraMark({ size = 28, className = '', blended = true }: {
  size?: number; className?: string; blended?: boolean;
}) {
  return (
    <Image
      src="/axiora-mark.png"
      alt="Axiora"
      width={size}
      height={size}
      className={cn('shrink-0 rounded-[8px]', blended && 'mix-blend-screen', className)}
      style={{ width: size, height: size }}
      priority={false}
    />
  );
}

export function AxioraLogo({ width = 150, className = '', blended = true }: {
  width?: number; className?: string; blended?: boolean;
}) {
  return (
    <Image
      src="/axiora-logo.png"
      alt="Axiora Protocol"
      width={width}
      height={Math.round(width * 0.62)}
      className={cn(blended && 'mix-blend-screen', className)}
      style={{ width, height: 'auto' }}
      priority={false}
    />
  );
}
