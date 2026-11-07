'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { paintTicketFaces, TICKET } from './ticketArt';

type Props = {
  registerUrl: string;
  /** 0 → 1 as the hero scrolls away; the ticket turns over to show its conditions of entry. */
  progressRef: React.RefObject<number>;
  onReady?: () => void;
  className?: string;
};

/** Ticket outline with semicircular bites at the perforation (the Festora notch). */
function ticketShape(perfX: number) {
  const { width: W, height: H, notch: r } = TICKET;
  const s = new THREE.Shape();
  s.moveTo(-W / 2, -H / 2);
  s.lineTo(perfX - r, -H / 2);
  s.absarc(perfX, -H / 2, r, Math.PI, 0, true);
  s.lineTo(W / 2, -H / 2);
  s.lineTo(W / 2, H / 2);
  s.lineTo(perfX + r, H / 2);
  s.absarc(perfX, H / 2, r, 0, Math.PI, true);
  s.lineTo(-W / 2, H / 2);
  s.closePath();
  return s;
}

function faceGeometry(perfX: number) {
  const g = new THREE.ShapeGeometry(ticketShape(perfX), 32);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + TICKET.width / 2) / TICKET.width, (pos.getY(i) + TICKET.height / 2) / TICKET.height);
  }
  uv.needsUpdate = true;
  return g;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function TicketScene({ registerUrl, progressRef, onReady, className = '' }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, coarse ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, 12.5);

    // Lights: warm key, crimson rim, and a roving glint that follows the pointer across the foil.
    const key = new THREE.DirectionalLight(0xfff1dc, 2.1);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0xc8102e, 30, 18, 2);
    rim.position.set(5, -2.5, 2.5);
    scene.add(rim);
    const glint = new THREE.PointLight(0xffe2b0, 22, 14, 2);
    glint.position.set(0, 1.5, 5);
    scene.add(glint);

    const stage = new THREE.Group(); // composition offset (desktop: sits in the open quadrant beside the type)
    scene.add(stage);
    const ticket = new THREE.Group();
    const tilt = new THREE.Group(); // pointer tilt lives on its own group so it composes with scroll
    tilt.add(ticket);
    stage.add(tilt);

    const perfX = -TICKET.width / 2 + TICKET.width * TICKET.stubAt;
    const disposables: { dispose: () => void }[] = [envTex, pmrem];

    // Card body (edges)
    const bodyGeo = new THREE.ExtrudeGeometry(ticketShape(perfX), { depth: TICKET.depth, bevelEnabled: false, curveSegments: 32 });
    bodyGeo.translate(0, 0, -TICKET.depth / 2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd8c29b, roughness: 0.85 });
    ticket.add(new THREE.Mesh(bodyGeo, bodyMat));
    disposables.push(bodyGeo, bodyMat);

    let frameId = 0;
    let disposed = false;
    let visible = true;
    let ready = false;
    let introStart = 0;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const t0 = performance.now();
    const elapsed = () => (performance.now() - t0) / 1000;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (!w || !h) return;
      camera.aspect = w / h;
      // Keep the whole ticket in frame on narrow screens.
      const fitDist = (TICKET.width * 1.32) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      camera.position.z = w >= 1024 ? Math.max(12.5, fitDist) : fitDist * 0.92;
      camera.updateProjectionMatrix();
      const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const visW = visH * camera.aspect;
      const wide = w >= 1024;
      stage.position.set(wide ? -0.16 * visW : 0, wide ? 0.015 * visH : 0, 0);
      stage.scale.setScalar(wide ? 0.94 : 1);
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      if (ready && (reduceMotion || !visible)) renderer.render(scene, camera);
    };

    const onPointer = (e: PointerEvent) => {
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const frame = () => {
      if (disposed) return;
      frameId = 0;
      const t = elapsed();
      const p = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);

      // Intro: the ticket is "issued" — spins in from edge-on.
      const intro = reduceMotion ? 1 : easeOutExpo(Math.min(1, (t - introStart) / 2.2));

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const idle = reduceMotion ? 0 : 1;
      const autoSway = coarse ? Math.sin(t * 0.5) * 0.18 : 0;

      tilt.rotation.y = (pointer.x * 0.32 + autoSway) * idle;
      tilt.rotation.x = pointer.y * 0.22 * idle;

      ticket.rotation.y = (1 - intro) * -Math.PI * 0.62 + p * Math.PI * 0.94 - 0.22;
      ticket.rotation.x = 0.12 - p * 0.18;
      ticket.rotation.z = -0.07 + (1 - intro) * 0.2 + Math.sin(t * 0.6) * 0.012 * idle;
      ticket.position.y = Math.sin(t * 0.8) * 0.06 * idle + p * 0.6;
      ticket.position.z = (1 - intro) * -3 - p * 1.2;

      glint.position.x = pointer.x * 4.5;
      glint.position.y = -pointer.y * 2.5 + 1;

      renderer.render(scene, camera);
      if (!reduceMotion && visible) frameId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (!frameId && !disposed && ready) frameId = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
      },
      { threshold: 0 },
    );
    io.observe(container);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Reduced motion still responds to scroll (it is user-driven), just without idle animation.
    const onScroll = () => {
      if (reduceMotion && ready) frame();
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Encode this deployment's own origin so the QR is always correct, whatever the domain.
    const qrTarget = `${window.location.origin}${new URL(registerUrl, window.location.origin).pathname}`;
    paintTicketFaces(qrTarget)
      .then((faces) => {
        if (disposed) return;
        const maxAniso = renderer.capabilities.getMaxAnisotropy();
        const tex = (c: HTMLCanvasElement, srgb: boolean) => {
          const t = new THREE.CanvasTexture(c);
          t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          t.anisotropy = Math.min(8, maxAniso);
          disposables.push(t);
          return t;
        };
        const faceMat = (color: HTMLCanvasElement, mat: HTMLCanvasElement, clearcoat: number, envMapIntensity: number) => {
          const m = new THREE.MeshPhysicalMaterial({
            map: tex(color, true),
            roughnessMap: tex(mat, false),
            metalnessMap: tex(mat, false),
            roughness: 1,
            metalness: 1,
            clearcoat,
            clearcoatRoughness: 0.5,
            envMapIntensity,
          });
          disposables.push(m);
          return m;
        };

        const frontGeo = faceGeometry(perfX);
        const front = new THREE.Mesh(frontGeo, faceMat(faces.front.color, faces.front.mat, 0.12, 1.05));
        front.position.z = TICKET.depth / 2 + 0.0006;
        ticket.add(front);

        const backGeo = faceGeometry(-perfX);
        const back = new THREE.Mesh(backGeo, faceMat(faces.back.color, faces.back.mat, 0.05, 0.7));
        back.rotation.y = Math.PI;
        back.position.z = -TICKET.depth / 2 - 0.0006;
        ticket.add(back);
        disposables.push(frontGeo, backGeo);

        ready = true;
        introStart = elapsed();
        frame();
        onReady?.();
      })
      .catch(() => {
        /* Poster stays visible if the art fails to paint. */
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, [registerUrl, progressRef, onReady]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
