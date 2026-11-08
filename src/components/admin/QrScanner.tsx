'use client';

import { useEffect, useRef, useState } from 'react';

/** Matches the server's own ticket-id pattern (src/app/api/admin/checkin/route.ts). */
const TICKET_RE = /LT26-[A-Z0-9]{6}/;
const RESCAN_COOLDOWN_MS = 4000;
const SCAN_INTERVAL_MS = 300;

type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>> };

/** Camera-based QR check-in. Uses the native BarcodeDetector where available, jsQR elsewhere. */
export function QrScanner({ active, onDetect }: { active: boolean; onDetect: (ticketId: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Keep the camera/stream alive across re-renders: read the latest callback
  // from a ref instead of restarting the effect whenever onDetect's identity changes.
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let busy = false;
    let lastCode = '';
    let lastAt = 0;

    async function start() {
      let detector: BarcodeDetectorLike | null = null;
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => BarcodeDetectorLike }).BarcodeDetector({ formats: ['qr_code'] });
        } catch {
          detector = null;
        }
      }
      const decodeFallback = detector ? null : (await import('jsqr')).default;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch {
        if (!cancelled) setError('Camera access was denied or unavailable. Allow camera permission, or use the text field above.');
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => {});
      if (cancelled) return;
      setReady(true);

      timer = setInterval(async () => {
        if (busy || cancelled) return;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) return;
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) return;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);

        busy = true;
        try {
          let text: string | null = null;
          if (detector) {
            const codes = await detector.detect(canvas).catch(() => []);
            text = codes[0]?.rawValue ?? null;
          } else if (decodeFallback) {
            const { data } = ctx.getImageData(0, 0, w, h);
            text = decodeFallback(data, w, h)?.data ?? null;
          }
          const match = text?.toUpperCase().match(TICKET_RE);
          if (match) {
            const now = Date.now();
            if (match[0] !== lastCode || now - lastAt > RESCAN_COOLDOWN_MS) {
              lastCode = match[0];
              lastAt = now;
              onDetectRef.current(match[0]);
            }
          }
        } finally {
          busy = false;
        }
      }, SCAN_INTERVAL_MS);
    }

    start();
    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
      setReady(false);
      setError(null);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="relative mt-4 w-full max-w-sm overflow-hidden border border-[var(--rule-strong)] bg-ink">
      <video ref={videoRef} playsInline muted className="aspect-square w-full bg-black object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      {ready ? <span aria-hidden className="pointer-events-none absolute inset-8 border-2 border-champagne/70" /> : null}
      {!ready && !error ? <p className="label absolute inset-0 flex items-center justify-center p-4 text-center text-muted">Starting camera…</p> : null}
      {error ? <p className="label absolute inset-0 flex items-center justify-center bg-ink p-4 text-center text-ember">{error}</p> : null}
    </div>
  );
}
