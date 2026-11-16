"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function EventPosterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const hideAfter = new Date("2026-11-25T00:00:00");
    const timeUntilHide = hideAfter.getTime() - Date.now();

    if (timeUntilHide <= 0) return;

    const openTimeout = window.setTimeout(() => setIsOpen(true), 0);
    const hideTimeout = window.setTimeout(
      () => setIsOpen(false),
      timeUntilHide,
    );

    return () => {
      window.clearTimeout(openTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pozvánka na vánoční dílničky"
        className="relative flex max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center"
      >
        <Image
          src="/photos/vanocni-dilnicky-2026.jpg"
          alt="Pozvánka na vánoční dílničky v úterý 24. listopadu 2026 od 16 do 18 hodin"
          width={768}
          height={1086}
          unoptimized
          priority
          className="h-auto max-h-[calc(100dvh-2rem)] w-auto max-w-[calc(100vw-2rem)] rounded-lg object-contain shadow-2xl"
        />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Zavřít pozvánku"
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition hover:bg-gray-100"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="size-6"
          >
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
