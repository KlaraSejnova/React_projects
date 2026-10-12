"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { menuItems } from "@/app/data/home-data";

export default function SiteNavigation() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-3 z-40 mx-3 mb-[-4.5rem] flex items-center justify-between rounded-full border border-white/50 bg-white/50 px-6 py-2 shadow-lg backdrop-blur-md sm:mx-auto sm:max-w-4xl">
        <a href="#uvod" className="font-black">
          Klub rodičů
        </a>
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full hover:bg-pink-200"
        >
          <span className="h-0.5 w-6 bg-indigo-950" />
          <span className="h-0.5 w-6 bg-indigo-950" />
          <span className="h-0.5 w-6 bg-indigo-950" />
        </button>
      </header>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-0 z-50 bg-pink-500 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Zavřít menu"
          onClick={() => setMenuOpen(false)}
          className="absolute right-6 top-5 text-5xl font-black text-indigo-950"
        >
          ×
        </button>
        <nav className="flex h-full flex-col items-center justify-center gap-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-5xl font-black text-indigo-950 transition hover:scale-110 hover:text-white sm:text-6xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
