'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useCallback, useState, useSyncExternalStore } from 'react';

const TicketScene = dynamic(() => import('./TicketScene'), { ssr: false });

const noop = () => () => {};
function detectWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Hosts the 3D ticket. A poster rendered from the same scene paints first
 * (instant LCP, no layout shift) and stays as the fallback without WebGL.
 * Poster placement mirrors the scene composition measured from the render:
 * on wide stages the camera fits by height, so the ticket's size tracks the
 * stage height and its offset tracks the stage width.
 */
export function TicketStage({ registerUrl, progressRef, className = '' }: { registerUrl: string; progressRef: React.RefObject<number>; className?: string }) {
  const webgl = useSyncExternalStore(noop, detectWebGL, () => null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div className={`relative ${className}`}>
      <Image
        src="/ticket-poster.webp"
        alt=""
        width={1261}
        height={676}
        priority
        sizes="(min-width: 1024px) 45vw, 80vw"
        className={`absolute left-1/2 top-1/2 h-auto w-[84%] max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 lg:left-[35.12%] lg:top-[52.05%] lg:h-[40.8%] lg:w-auto ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {webgl ? <TicketScene registerUrl={registerUrl} progressRef={progressRef} onReady={onReady} className="absolute inset-0" /> : null}
    </div>
  );
}
