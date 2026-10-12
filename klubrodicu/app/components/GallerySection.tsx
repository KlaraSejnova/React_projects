"use client";

import { useEffect, useState, type FocusEvent } from "react";
import Link from "next/link";
import { gallerySlides } from "@/app/data/home-data";
import { Wave } from "@/app/components/Visuals";

const headingClass = "text-4xl font-black tracking-tight sm:text-6xl";

export default function GallerySection() {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (paused || !playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % gallerySlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, playing]);

  function go(direction: number) {
    setSlide(
      (current) =>
        (current + direction + gallerySlides.length) % gallerySlides.length,
    );
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
  }

  return (
    <section className="relative bg-violet-600 px-4 py-24 text-white">
      <Wave fill="fill-[#fff4e0]" top />
      <div className="mx-auto max-w-5xl">
        <h2 className={`${headingClass} mb-3 text-center`}>Z našich akcí</h2>
        <p className="mb-8 text-center text-white/85">
          Malá ochutnávka z klubových a školních akcí.
        </p>
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-tl-[4rem] rounded-br-[4rem] rounded-bl-3xl rounded-tr-3xl bg-indigo-950 shadow-2xl ring-4 ring-yellow-300 sm:aspect-[16/9]"
          role="region"
          aria-roledescription="carousel"
          aria-label="Fotky z akcí klubu"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={handleBlur}
        >
          {gallerySlides.map((item, index) => (
            <div
              key={item.src}
              role="img"
              aria-label={item.title}
              aria-hidden={index !== slide}
              className={`absolute inset-0 bg-cover transition-opacity duration-700 ${index === slide ? "opacity-100" : "opacity-0"}`}
              style={{
                backgroundImage: `url(${item.src})`,
                backgroundPosition: item.pos,
              }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/35 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-7">
            <p className="text-lg font-black sm:text-2xl">
              {gallerySlides[slide].title}
            </p>
          </div>
          <button
            type="button"
            aria-label="Předchozí fotografie"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-indigo-950/45 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-yellow-300 hover:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
            >
              <path
                d="m14.5 5-7 7 7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Další fotografie"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-indigo-950/45 text-white shadow-lg backdrop-blur-md transition duration-200 hover:scale-110 hover:bg-yellow-300 hover:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-6"
            >
              <path
                d="m9.5 5 7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-indigo-950/55 p-2 backdrop-blur-sm">
            <button
              type="button"
              aria-label={
                playing ? "Pozastavit prezentaci" : "Spustit prezentaci"
              }
              onClick={() => setPlaying((current) => !current)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-sm text-indigo-950 hover:bg-white"
            >
              {playing ? "⏸" : "▶"}
            </button>
            {gallerySlides.map((item, index) => (
              <button
                type="button"
                key={item.src}
                aria-label={`Fotografie ${index + 1}: ${item.title}`}
                aria-current={index === slide}
                onClick={() => setSlide(index)}
                className={`h-2.5 rounded-full transition-all ${index === slide ? "w-6 bg-yellow-300" : "w-2.5 bg-white/70"}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/galerie"
            className="group inline-flex items-center gap-3 rounded-full bg-yellow-300 px-6 py-3 font-black text-indigo-950 transition hover:scale-105 hover:bg-white"
          >
            Prohlédnout celou fotogalerii
            <span
              aria-hidden
              className="grid size-9 place-items-center rounded-full bg-indigo-950/10 transition group-hover:translate-x-1 group-hover:bg-indigo-950/15"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-4">
                <path
                  d="M4.5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
      <Wave fill="fill-[#fff4e0]" />
    </section>
  );
}
