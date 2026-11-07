type IconProps = { className?: string; size?: number };

export function ArrowRight({ className = '', size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowUpRight({ className = '', size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 12.5l9-9M5 3.5h7.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowDown({ className = '', size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1v13M3 9l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export function Plus({ className = '', size = 16 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/** The notch, as a standalone ornament (semicircle bite in a square). */
export function NotchMark({ className = '', size = 12 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M0 0h12v3.5a2.5 2.5 0 0 0 0 5V12H0z" fill="currentColor" />
    </svg>
  );
}
