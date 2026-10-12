"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from "react";
import { GALLERY } from "./gallery-data";

const PAGE = 24;
const ALL = -1;
const PILL = [
  "bg-pink-500 text-white",
  "bg-sky-500 text-white",
  "bg-orange-400",
  "bg-lime-300",
  "bg-violet-600 text-white",
];

export default function PhotoArchive() {
  const [yearIdx, setYearIdx] = useState(0);
  const [albumIdx, setAlbumIdx] = useState(ALL);
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const year = GALLERY[yearIdx];

  const photos = useMemo(() => {
    const albums = albumIdx === ALL ? year.albums : [year.albums[albumIdx]];
    return albums.flatMap((a) =>
      a.files.map((f) => ({
        full: `/photos/gallery/${a.dir}/${f}.jpg`,
        thumb: `/photos/gallery/${a.dir}/t_${f}.jpg`,
        title: a.title,
      })),
    );
  }, [year, albumIdx]);

  const move = (d: number) =>
    setOpen((o) => (o === null ? o : (o + d + photos.length) % photos.length));

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, photos.length]);

  const pickYear = (i: number) => {
    setYearIdx(i);
    setAlbumIdx(ALL);
    setLimit(PAGE);
  };

  const pickAlbum = (i: number) => {
    setAlbumIdx(i);
    setLimit(PAGE);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h3 className="mb-4 text-center text-2xl font-black sm:text-3xl">
        Archiv fotek
      </h3>

      <div
        className="flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Školní rok"
      >
        {GALLERY.map((y, i) => (
          <button
            key={y.year}
            onClick={() => pickYear(i)}
            aria-pressed={i === yearIdx}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              i === yearIdx
                ? "bg-indigo-950 text-yellow-300"
                : "bg-white hover:bg-yellow-200"
            }`}
          >
            {y.year}
          </button>
        ))}
      </div>

      <div
        className="mt-4 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Akce"
      >
        <button
          onClick={() => pickAlbum(ALL)}
          aria-pressed={albumIdx === ALL}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${albumIdx === ALL ? "bg-indigo-950 text-white" : "bg-white/70 hover:bg-white"}`}
        >
          Vše
        </button>
        {year.albums.map((a, i) => (
          <button
            key={a.dir}
            onClick={() => pickAlbum(i)}
            aria-pressed={albumIdx === i}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              albumIdx === i
                ? "bg-indigo-950 text-white"
                : `${PILL[i % PILL.length]} hover:scale-105`
            }`}
          >
            {a.title} <span className="opacity-70">({a.files.length})</span>
          </button>
        ))}
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.slice(0, limit).map((p, i) => (
          <li key={p.full}>
            <button
              onClick={() => setOpen(i)}
              aria-label={`Zvětšit fotku: ${p.title}`}
              className="group block aspect-square w-full overflow-hidden rounded-2xl bg-white shadow transition hover:-rotate-1 hover:scale-[1.03]"
            >
              <img
                src={p.thumb}
                alt={p.title}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-110"
              />
            </button>
          </li>
        ))}
      </ul>

      {limit < photos.length && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="rounded-full bg-pink-500 px-6 py-3 font-bold text-white transition hover:scale-105"
          >
            Zobrazit další ({photos.length - limit})
          </button>
        </div>
      )}

      {open !== null && photos[open] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zvětšená fotka"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-indigo-950/95 p-4"
          onClick={() => setOpen(null)}
        >
          <img
            src={photos[open].full}
            alt={photos[open].title}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Zavřít"
            onClick={() => setOpen(null)}
            className="absolute right-4 top-4 h-11 w-11 rounded-full bg-yellow-300 text-2xl font-black text-indigo-950"
          >
            ×
          </button>
          <button
            aria-label="Předchozí fotka"
            onClick={(e) => {
              e.stopPropagation();
              move(-1);
            }}
            className="absolute left-3 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-yellow-300 text-2xl text-indigo-950"
          >
            ‹
          </button>
          <button
            aria-label="Další fotka"
            onClick={(e) => {
              e.stopPropagation();
              move(1);
            }}
            className="absolute right-3 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full bg-yellow-300 text-2xl text-indigo-950"
          >
            ›
          </button>
          <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white">
            {photos[open].title} · {open + 1} / {photos.length}
          </p>
        </div>
      )}
    </div>
  );
}
