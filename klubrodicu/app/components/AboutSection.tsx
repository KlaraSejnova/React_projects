"use client";

import { useState } from "react";
import { Counter, Reveal } from "@/app/components/Visuals";
import { newsItems } from "@/app/data/home-data";

const aboutTabs = {
  Členství: (
    <p>
      Členem Klubu rodičů může být každý rodič, zákonný zástupce dítěte
      studujícího na škole, přítel školy nebo sponzor. Má právo být zvolen do
      orgánů sdružení, aktivně se podílet na činnosti, vyjadřovat své názory,
      náměty a připomínky.
    </p>
  ),
  Cíle: (
    <ul className="list-disc space-y-1 pl-5">
      <li>podporovat rozvoj vzdělávání včetně zájmové činnosti</li>
      <li>sjednocovat působení rodiny a školy</li>
      <li>vytvářet podmínky pro spolupráci rodičů a učitelů</li>
      <li>podporovat mezinárodní styky školy</li>
      <li>podporovat sociálně slabší studenty</li>
      <li>odměňovat vynikající studenty</li>
    </ul>
  ),
  "Přidej se": (
    <p>
      Na škole je přibližně 600 žáků, tedy cca 1000 rodičů, a v Klubu je 10
      aktivních členů. Pojďte s námi pokračovat a užijte si to s námi!
    </p>
  ),
} as const;

const headingClass = "text-4xl font-black tracking-tight sm:text-6xl";

export default function AboutSection() {
  const [tab, setTab] = useState<keyof typeof aboutTabs>("Členství");
  const featuredNews = newsItems[0];

  return (
    <section id="o-klubu" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className={`${headingClass} mb-8 text-center`}>Klub v kostce</h2>
      <div className="grid auto-rows-[9.5rem] grid-cols-2 gap-4 md:grid-cols-4">
        <Reveal className="col-span-2 row-span-2 flex flex-col justify-center rounded-[3rem] rounded-tr-[7rem] bg-pink-500 p-8 text-white">
          <p className="text-sm font-bold uppercase tracking-widest">
            {featuredNews ? "Nejbližší akce" : "Aktuality"}
          </p>
          <p className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
            {featuredNews?.title ?? "Sledujte novinky"}
          </p>
          <p className="mt-2 text-xl font-semibold">
            {featuredNews?.date ?? "Brzy přidáme další informace."}
          </p>
        </Reveal>
        <Counter
          to={2005}
          label="rok vzniku"
          className="bg-sky-500 text-white"
        />
        <Counter to={600} label="žáků ve škole" className="bg-lime-300" />
        <Counter to={1000} label="rodičů" className="bg-orange-300" />
        <Counter
          to={10}
          label="aktivních členů"
          className="bg-violet-600 text-white"
        />

        <div className="col-span-2 row-span-2 flex flex-col rounded-[3rem] rounded-bl-[7rem] bg-white p-6 shadow">
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(aboutTabs) as (keyof typeof aboutTabs)[]).map(
              (item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  aria-pressed={tab === item}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    tab === item
                      ? "bg-indigo-950 text-yellow-300"
                      : "bg-yellow-200 hover:bg-yellow-300"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className="overflow-y-auto text-sm leading-relaxed">
            {aboutTabs[tab]}
          </div>
        </div>

        <a
          href="#klubovy-ucet"
          className="group col-span-2 flex items-center justify-between rounded-[2rem] bg-orange-400 p-6 text-2xl font-black transition hover:-rotate-1 hover:scale-[1.02]"
        >
          Přispěj klubu rodičů
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-full border border-indigo-950/15 bg-white/35 transition duration-300 group-hover:translate-x-1 group-hover:bg-white/65"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="size-5 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path
                d="M4.5 12h14m-6-6 6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
        <a
          href="https://www.facebook.com/groups/2869762866466630"
          target="_blank"
          rel="noopener noreferrer"
          className="group col-span-2 flex items-center justify-between rounded-[2rem] bg-sky-300 p-6 text-2xl font-black transition hover:rotate-1 hover:scale-[1.02]"
        >
          Facebooková skupina
          <span
            aria-hidden
            className="grid size-12 shrink-0 place-items-center rounded-full border border-indigo-950/15 bg-white/35 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:bg-white/65"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-5">
              <path
                d="M7 17 17 7M8 7h9v9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
