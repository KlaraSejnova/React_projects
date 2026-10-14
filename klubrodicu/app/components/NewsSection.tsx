"use client";

import { useState } from "react";
import { newsItems } from "@/app/data/home-data";
import { Reveal } from "@/app/components/Visuals";

const headingClass = "text-4xl font-black tracking-tight sm:text-6xl";
const initialNewsCount = 3;

export default function NewsSection() {
  const [showAllNews, setShowAllNews] = useState(false);
  const visibleNews = showAllNews
    ? newsItems
    : newsItems.slice(0, initialNewsCount);

  return (
    <section id="aktuality" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className={`${headingClass} mb-8 text-center`}>Aktuality</h2>
      <div id="news-list" className="grid gap-5 sm:grid-cols-3">
        {visibleNews.map((news, index) => (
          <Reveal key={`${news.title}-${news.date}`}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className={`block h-full rounded-[2.5rem] p-7 transition hover:rotate-0 hover:scale-105 ${index % 2 ? "rotate-1" : "-rotate-1"} ${news.color}`}
            >
              <p className="text-sm font-bold">{news.date}</p>
              <h3 className="mt-2 text-2xl font-black leading-tight">
                {news.title}
              </h3>
            </a>
          </Reveal>
        ))}
      </div>
      {newsItems.length > initialNewsCount && (
        <div className="mt-8 text-center">
          <button
            type="button"
            aria-expanded={showAllNews}
            aria-controls="news-list"
            onClick={() => setShowAllNews((showing) => !showing)}
            className="rounded-full border-2 border-indigo-950 px-6 py-3 font-bold transition hover:bg-indigo-950 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-950"
          >
            {showAllNews ? "Zobrazit méně" : "Zobrazit všechny aktuality"}
          </button>
        </div>
      )}
    </section>
  );
}
