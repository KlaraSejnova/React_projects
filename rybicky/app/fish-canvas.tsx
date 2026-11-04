"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { FishScene, SOLID_RED_PATTERN, type Fish } from "./fish-model";

type Bubble = { x: number; y: number; r: number; speed: number };
type Food = {
  x: number;
  y: number;
  size: number;
  life: number;
  redFishOnly: boolean;
};
type Ripple = { x: number; y: number; age: number };

const FISH_COUNT = 25;
const BITE_DURATION = 0.45;
const RIPPLE_DURATION = 1.1;

function createFish(w: number, h: number, pattern: number): Fish {
  const dir = Math.random() < 0.5 ? -1 : 1;
  const size = 14 + Math.random() * 34;
  const speed =
    (30 + Math.random() * 70) *
    (0.5 + size / 48) *
    (pattern === SOLID_RED_PATTERN ? 1.5 : 1);
  return {
    x: Math.random() * w,
    y: 40 + Math.random() * (h - 120),
    vx: dir * speed,
    vy: (Math.random() - 0.5) * 24,
    speed,
    size,
    pattern,
    phase: Math.random() * Math.PI * 2,
    wobble: 6 + Math.random() * 14,
    mouthOpen: 0,
    feeding: 0,
    seekingFood: false,
    visibility: 0.5,
    depthProgress: Math.random(),
  };
}

export default function FishCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fishRef = useRef<Fish[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let fish: Fish[] = [];
    let bubbles: Bubble[] = [];
    let food: Food[] = [];
    let ripples: Ripple[] = [];
    let raf = 0;
    let last = performance.now();

    const addFood = (x: number, y: number) => {
      food.push(
        ...Array.from({ length: 7 }, (_, index) => ({
          x: x + (Math.random() - 0.5) * 34,
          y: y + (Math.random() - 0.5) * 24,
          size: 3 + Math.random() * 3,
          life: index === 0 ? 45 : 12,
          redFishOnly: index === 0,
        })),
      );
      ripples.push({ x, y, age: 0 });
    };

    const handleClick = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      addFood(event.clientX - bounds.left, event.clientY - bounds.top);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        addFood(w / 2, h / 2);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (fish.length === 0) {
        fish = Array.from({ length: FISH_COUNT }, (_, index) =>
          createFish(
            w,
            h,
            index === FISH_COUNT - 1 ? SOLID_RED_PATTERN : index % 3,
          ),
        );
        fishRef.current = fish;
        bubbles = Array.from({ length: 30 }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 2 + Math.random() * 5,
          speed: 15 + Math.random() * 35,
        }));
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      const grad = ctx.createRadialGradient(w * 0.42, h * 0.24, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.82);
      grad.addColorStop(0, "#62cbbb");
      grad.addColorStop(0.48, "#168b8c");
      grad.addColorStop(1, "#06445a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const reflection = ctx.createRadialGradient(w * 0.34, h * 0.2, 0, w * 0.34, h * 0.2, Math.max(w, h) * 0.55);
      reflection.addColorStop(0, "rgba(218, 255, 231, 0.13)");
      reflection.addColorStop(1, "rgba(218, 255, 231, 0)");
      ctx.fillStyle = reflection;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(221, 255, 239, 0.055)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const x = ((i * 193 + t * 9) % (w + 240)) - 120;
        const y = h * (0.16 + (i % 5) * 0.17);
        ctx.beginPath();
        ctx.ellipse(x, y, 42 + (i % 3) * 16, 8, -0.15, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = "rgba(255,255,255,0.24)";
      for (const bubble of bubbles) {
        bubble.y -= bubble.speed * dt;
        if (bubble.y < -10) {
          bubble.y = h + 10;
          bubble.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(bubble.x + Math.sin(t + bubble.y / 40) * 6, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fill();
      }

      food = food.filter((crumb) => {
        crumb.life -= dt;
        return crumb.life > 0;
      });

      const windDrift = Math.sin(t * 1.1) * 24 * dt;
      for (const crumb of food) {
        crumb.x += windDrift;
      }

      ripples = ripples.filter((ripple) => {
        ripple.age += dt;
        ripple.x += windDrift;
        return ripple.age < RIPPLE_DURATION + 0.36;
      });

      for (const ripple of ripples) {
        for (let ring = 0; ring < 3; ring++) {
          const progress = (ripple.age - ring * 0.18) / RIPPLE_DURATION;
          if (progress < 0 || progress > 1) continue;

          ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - progress) * 0.32})`;
          ctx.lineWidth = 1.5 - progress * 0.6;
          ctx.beginPath();
          ctx.arc(
            ripple.x,
            ripple.y,
            7 + progress * 90,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }

      fish = fish.map((f) => {
        const redFishTarget = food.find((crumb) => crumb.redFishOnly);
        const target = f.feeding > 0
          ? null
          : food.reduce<Food | null>((nearest, crumb) => {
            const isRedFish = f.pattern === SOLID_RED_PATTERN;
            if (crumb.redFishOnly && !isRedFish) return nearest;
            if (isRedFish && redFishTarget && crumb !== redFishTarget) return nearest;
            if (
              Math.hypot(f.x - crumb.x, f.y - crumb.y) > 280 &&
              !(isRedFish && crumb === redFishTarget)
            ) {
              return nearest;
            }
            return !nearest ||
              Math.hypot(f.x - crumb.x, f.y - crumb.y) <
                Math.hypot(f.x - nearest.x, f.y - nearest.y)
              ? crumb
              : nearest;
          }, null);

        if (target) {
          const dx = target.x - f.x;
          const dy = target.y - f.y;
          const distance = Math.hypot(dx, dy);
          f.vx = distance > 0 ? (dx / distance) * f.speed : 0;
          f.vy = distance > 0 ? (dy / distance) * f.speed : 0;
        } else if (f.feeding <= 0) {
          f.vx = Math.sign(f.vx || 1) * f.speed;
          const swimY = Math.sin(t * 0.55 + f.phase) * 28;
          f.vy += (swimY - f.vy) * Math.min(1, dt * 0.8);
        }
        if (f.feeding <= 0) {
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          const margin = Math.min(f.size * 1.5, Math.min(w, h) * 0.4);
          if (f.x < margin || f.x > w - margin) f.vx *= -1;
          if (f.y < margin || f.y > h - margin) f.vy *= -1;
          f.x = Math.max(margin, Math.min(w - margin, f.x));
          f.y = Math.max(margin, Math.min(h - margin, f.y));
        }

        const biteDistance = f.size * (f.pattern === SOLID_RED_PATTERN ? 2.4 : 1.05);
        if (target && Math.hypot(f.x - target.x, f.y - target.y) <= biteDistance) {
          food = food.filter((crumb) => crumb !== target);
          f.feeding = BITE_DURATION;
        }

        f.seekingFood = Boolean(target) || f.feeding > 0;
        const biteProgress = f.feeding > 0
          ? 1 - f.feeding / BITE_DURATION
          : 0;
        const bite = f.feeding > 0 ? Math.sin(Math.PI * biteProgress) : 0;
        f.mouthOpen += (bite - f.mouthOpen) * Math.min(1, dt * 18);
        f.feeding = Math.max(0, f.feeding - dt);
        return f;
      });

      for (const crumb of food) {
        ctx.fillStyle = `rgba(255, 202, 106, ${Math.min(1, crumb.life / 2)})`;
        ctx.beginPath();
        ctx.arc(crumb.x, crumb.y, crumb.size, 0, Math.PI * 2);
        ctx.fill();
      }

      fishRef.current = fish;
      raf = requestAnimationFrame(frame);
    };

    resize();
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        role="button"
        aria-label="Kliknutím nakrmíte rybičky. Klávesou Enter nebo mezerníkem přidáte krmení doprostřed."
        tabIndex={0}
        className="absolute inset-0 h-full w-full cursor-crosshair outline-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <Canvas
          orthographic
          camera={{
            position: [0, 180, 0],
            up: [0, 0, -1],
            near: 0.1,
            far: 300,
          }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          style={{ pointerEvents: "none" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <FishScene fishRef={fishRef} count={FISH_COUNT} />
        </Canvas>
      </div>
    </div>
  );
}
