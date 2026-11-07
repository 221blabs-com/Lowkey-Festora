import Image from 'next/image';

/**
 * Festora brand assets, used unaltered:
 *  - mark: festora-v1/public/logo.png (official transparent mark), trimmed of empty padding only
 *  - wordmark: keyed losslessly out of the supplied lockup (letterforms untouched)
 * Aspect ratios are fixed here so the identity can never be stretched.
 */
const MARK_RATIO = 1456 / 1611; // w / h of the trimmed mark
const WORDMARK_RATIO = 1144 / 202;

export function FestoraMark({ height = 32, className = '', priority = false }: { height?: number; className?: string; priority?: boolean }) {
  const width = Math.round(height * MARK_RATIO);
  return (
    <Image
      src={height > 120 ? '/brand/festora-mark-1024.png' : height > 60 ? '/brand/festora-mark-512.png' : '/brand/festora-mark-256.png'}
      alt=""
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width, height }}
      unoptimized
    />
  );
}

export function FestoraWordmark({ height = 14, className = '' }: { height?: number; className?: string }) {
  const width = Math.round(height * WORDMARK_RATIO);
  return (
    <Image
      src="/brand/festora-wordmark.png"
      alt="Festora"
      width={width}
      height={height}
      className={className}
      style={{ width, height }}
      unoptimized
    />
  );
}

export function FestoraLockup({ markHeight = 30, className = '' }: { markHeight?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <FestoraMark height={markHeight} priority />
      <FestoraWordmark height={Math.round(markHeight * 0.42)} />
    </span>
  );
}
