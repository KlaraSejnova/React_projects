"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${shown ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

export function Counter({
  to,
  label,
  className,
}: {
  to: number;
  label: string;
  className: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 1500, 1);
          setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) animationFrame = requestAnimationFrame(tick);
        };
        animationFrame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [to]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center rounded-[2rem] p-4 text-center transition hover:-rotate-3 hover:scale-105 ${className}`}
    >
      <p className="text-5xl font-black sm:text-6xl">{value}</p>
      <p className="mt-1 text-sm font-semibold">{label}</p>
    </div>
  );
}

export function KineticWord({
  text,
  offset = 0,
}: {
  text: string;
  offset?: number;
}) {
  return (
    <span
      className="block hover:[&>span]:[animation-play-state:paused]"
      aria-hidden
    >
      {text.split("").map((character, index) => (
        <span
          key={index}
          className="inline-block animate-[wave_3s_ease-in-out_infinite]"
          style={{ animationDelay: `${(index + offset) * 0.15}s` }}
        >
          {character}
        </span>
      ))}
    </span>
  );
}

export function Wave({ fill, top = false }: { fill: string; top?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-x-0 h-10 w-full sm:h-16 ${fill} ${top ? "top-0 rotate-180" : "bottom-0"}`}
    >
      <path d="M0 40 C240 90 480 0 720 40 C960 80 1200 0 1440 40 V80 H0 Z" />
    </svg>
  );
}
