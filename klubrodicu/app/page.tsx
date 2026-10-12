"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
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

function Counter({
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
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1500, 1);
          setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
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

function KineticWord({ text, offset = 0 }: { text: string; offset?: number }) {
  return (
    <span
      className="block hover:[&>span]:[animation-play-state:paused]"
      aria-hidden
    >
      {text.split("").map((c, i) => (
        <span
          key={i}
          className="inline-block animate-[wave_3s_ease-in-out_infinite]"
          style={{ animationDelay: `${(i + offset) * 0.15}s` }}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

function Wave({ fill, top = false }: { fill: string; top?: boolean }) {
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

const MENU = [
  { label: "Úvod", href: "#uvod" },
  { label: "O klubu", href: "#o-klubu" },
  { label: "Fotogalerie", href: "/galerie" },
  { label: "Aktuality", href: "#aktuality" },
  { label: "Přispíváme", href: "#prispivame" },
  { label: "Kontakt", href: "#kontakt" },
];

const SLIDES = [
  {
    title: "Soutěž o vánoční strom",
    src: "/photos/gallery/2024-2025_soutez-vanocni-strom/04.jpg",
    pos: "center 45%",
  },
  {
    title: "Vánoční vystoupení",
    src: "/photos/gallery/2023-2024_vanocni-vystoupeni/03.jpg",
    pos: "center 45%",
  },
  {
    title: "Finále dračích lodí",
    src: "/photos/gallery/2023-2024_draci-lode/01.jpg",
    pos: "center 50%",
  },
  {
    title: "Vánoční dílničky",
    src: "/photos/gallery/2023-2024_vanocni-dilnicky/12.jpg",
    pos: "center 45%",
  },
  {
    title: "Soutěž o vánoční strom",
    src: "/photos/gallery/2024-2025_soutez-vanocni-strom/01.jpg",
    pos: "center 55%",
  },
  {
    title: "Vánoční vystoupení",
    src: "/photos/gallery/2023-2024_vanocni-vystoupeni/01.jpg",
    pos: "center 45%",
  },
];

const NEWS = [
  {
    title: "Velikonoční tvoření",
    date: "24. 3. 2026, 16:00",
    color: "bg-pink-500 text-white",
  },
  {
    title: "Úvodní schůzka",
    date: "13. 10. 2025, 17:30",
    color: "bg-sky-300 text-indigo-950",
  },
  {
    title: "Schůzka + sklad",
    date: "14. 5. 2025, 16:30",
    color: "bg-orange-300 text-indigo-950",
  },
];

const ABOUT = {
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

const GIVING = [
  {
    title: "Kurzy první pomoci",
    color: "bg-pink-500 text-white",
    icon: <path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5z" />,
  },
  {
    title: "Obnova divadelní opony",
    color: "bg-violet-600 text-white",
    icon: (
      <>
        <path d="M4 4h16v7a8 8 0 0 1-16 0z" />
        <path d="M8.5 9v1.5M15.5 9v1.5M8 14c1.2 2.2 6.8 2.2 8 0" />
      </>
    ),
  },
  {
    title: "Dresy a medicinbaly",
    color: "bg-orange-400 text-indigo-950",
    icon: (
      <>
        <circle cx="12" cy="15" r="6" />
        <path d="M8.5 9.5 6 3h4l2 4 2-4h4l-2.5 6.5" />
      </>
    ),
  },
  {
    title: "Sbor a knihovna 1. stupně",
    color: "bg-sky-500 text-white",
    icon: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),
  },
  {
    title: "Finále dračích lodí",
    color: "bg-teal-500 text-white",
    src: "/new_year_element_197_a.svg",
  },
  {
    title: "Reproduktory na akce",
    color: "bg-yellow-300 text-indigo-950",
    icon: (
      <>
        <path d="M11 5 6 9H2v6h4l5 4z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      </>
    ),
  },
];

const GIVING_BY_YEAR = [
  {
    year: "2024/2025",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2024-2025/",
    projects: [
      "Vítání prvňáčků",
      "Odměny „Vánoční strom“",
      "Nákup reproduktorů",
      "Edison",
      "Startovné na Dračí lodě",
      "Loučení s deváťáky",
    ],
  },
  {
    year: "2023/2024",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2023-2024/",
    projects: [
      "Vítání prvňáčků",
      "Odměny v „Podzimní soutěži“",
      "Knihy pro 1. stupeň",
      "Kostýmy pro školní sbor na vánoční vystoupení",
      "Kurz první pomoci",
      "Cesta na finále závodů dračích lodí",
    ],
  },
  {
    year: "2022/2023",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2022-2023/",
    projects: ["Vítání prvňáčků", "Kurz první pomoci"],
  },
  {
    year: "2021/2022",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2021-2022/",
    projects: [
      "Vítání prvňáčků",
      "Nákup altánů a výzdoby školy",
      "Dárek pro odcházející deváťáky",
      "Loučení se školním rokem",
    ],
  },
  {
    year: "2020/2021",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2020-2021/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Dárek pro odcházející deváťáky",
    ],
  },
  {
    year: "2019/2020",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2019-2020/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Dárek pro odcházející deváťáky",
    ],
  },
  {
    year: "2018/2019",
    url: "https://klub-rodicu-pri-mzs-a-ms.webnode.cz/news/2018-2019/",
    projects: [
      "Vítání prvňáčků",
      "Projekt Edison",
      "Nákup nových dresů a vybavení do tělocvičny",
      "Kurz první pomoci",
      "Příspěvek na obnovu divadelní opony",
      "Doprava",
      "Dárek pro odcházející deváťáky",
    ],
  },
];

const H2 = "text-4xl font-black tracking-tight sm:text-6xl";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [tab, setTab] = useState<keyof typeof ABOUT>("Členství");

  useEffect(() => {
    if (paused || !playing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, playing]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const go = (direction: number) =>
    setSlide(
      (current) => (current + direction + SLIDES.length) % SLIDES.length,
    );

  return (
    <div className="overflow-x-clip bg-[#fff4e0] text-indigo-950">
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Přejít na obsah
      </a>

      <header className="sticky top-3 z-40 mx-3 mb-[-4.5rem] flex items-center justify-between rounded-full border border-white/50 bg-white/50 px-6 py-2 shadow-lg backdrop-blur-md sm:mx-auto sm:max-w-4xl">
        <a href="#uvod" className="font-black">
          Klub rodičů
        </a>
        <button
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
          aria-label="Zavřít menu"
          onClick={() => setMenuOpen(false)}
          className="absolute right-6 top-5 text-5xl font-black text-indigo-950"
        >
          ×
        </button>
        <nav className="flex h-full flex-col items-center justify-center gap-4">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              onClick={() => setMenuOpen(false)}
              className="text-5xl font-black text-indigo-950 transition hover:scale-110 hover:text-white sm:text-6xl"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </div>

      <main id="obsah">
        <section
          id="uvod"
          className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-yellow-300 px-6 pb-24 pt-28 text-center"
        >
          <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 animate-[morph_9s_ease-in-out_infinite] bg-pink-500" />
          <div className="pointer-events-none absolute -right-16 top-1/3 h-80 w-80 animate-[morph_11s_ease-in-out_infinite] bg-sky-400" />
          <div className="pointer-events-none absolute bottom-10 left-1/3 h-48 w-48 animate-[morph_7s_ease-in-out_infinite] bg-lime-300" />

          <h1
            aria-label="Klub rodičů"
            className="relative text-[19vw] font-black leading-[0.9] tracking-tight sm:text-[10rem]"
          >
            <KineticWord text="KLUB" />
            <KineticWord text="RODIČŮ" offset={4} />
          </h1>
          <p
            style={{ "--r": "-3deg" } as React.CSSProperties}
            className="relative mt-6 animate-[float_5s_ease-in-out_infinite] rounded-full bg-indigo-950 px-6 py-2 text-base font-bold text-yellow-300 sm:text-xl"
          >
            při MZŠ a MŠ Brno, Zemědělská
          </p>
          <Wave fill="fill-[#fff4e0]" />
        </section>

        <section id="o-klubu" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className={`${H2} mb-8 text-center`}>Klub v kostce</h2>
          <div className="grid auto-rows-[9.5rem] grid-cols-2 gap-4 md:grid-cols-4">
            <Reveal className="col-span-2 row-span-2 flex flex-col justify-center rounded-[3rem] rounded-tr-[7rem] bg-pink-500 p-8 text-white">
              <p className="text-sm font-bold uppercase tracking-widest">
                Příští schůzka klubu
              </p>
              <p className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
                středa 20. 5. 2026
              </p>
              <p className="mt-2 text-xl font-semibold">
                od 16:30 v budově Zemědělská
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
                {(Object.keys(ABOUT) as (keyof typeof ABOUT)[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    aria-pressed={tab === t}
                    className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                      tab === t
                        ? "bg-indigo-950 text-yellow-300"
                        : "bg-yellow-200 hover:bg-yellow-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="overflow-y-auto text-sm leading-relaxed">
                {ABOUT[tab]}
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

        <section id="aktuality" className="mx-auto max-w-5xl px-4 py-16">
          <h2 className={`${H2} mb-8 text-center`}>Aktuality</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {NEWS.map((n, i) => (
              <Reveal key={`${n.title}-${n.date}`}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block h-full rounded-[2.5rem] p-7 transition hover:rotate-0 hover:scale-105 ${i % 2 ? "rotate-1" : "-rotate-1"} ${n.color}`}
                >
                  <p className="text-sm font-bold">{n.date}</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight">
                    {n.title}
                  </h3>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="relative bg-violet-600 px-4 py-24 text-white">
          <Wave fill="fill-[#fff4e0]" top />
          <div className="mx-auto max-w-5xl">
            <h2 className={`${H2} mb-3 text-center`}>Z našich akcí</h2>
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
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setPaused(false);
                }
              }}
            >
              {SLIDES.map((item, index) => (
                <div
                  key={item.src}
                  role="img"
                  aria-label={item.title}
                  aria-hidden={index !== slide}
                  className={`absolute inset-0 bg-cover transition-opacity duration-700 ${
                    index === slide ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    backgroundImage: `url(${item.src})`,
                    backgroundPosition: item.pos,
                  }}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/35 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-7">
                <p className="text-lg font-black sm:text-2xl">
                  {SLIDES[slide].title}
                </p>
              </div>
              <button
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
                  aria-label={
                    playing ? "Pozastavit prezentaci" : "Spustit prezentaci"
                  }
                  onClick={() => setPlaying((current) => !current)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 text-sm text-indigo-950 hover:bg-white"
                >
                  {playing ? "⏸" : "▶"}
                </button>
                {SLIDES.map((item, index) => (
                  <button
                    key={item.src}
                    aria-label={`Fotografie ${index + 1}: ${item.title}`}
                    aria-current={index === slide}
                    onClick={() => setSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === slide
                        ? "w-6 bg-yellow-300"
                        : "w-2.5 bg-white/70"
                    }`}
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

        <section id="prispivame" className="relative bg-lime-300 px-4 py-24">
          <Wave fill="fill-[#fff4e0]" top />
          <div className="mx-auto max-w-5xl">
            <h2 className={`${H2} mb-2 text-center`}>Přispíváme</h2>
            <p className="mb-8 text-center font-medium">
              Dary rodičů pomáhají škole a žákům všech ročníků.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {GIVING.map((g, i) => (
                <Reveal
                  key={g.title}
                  className={`flex flex-col items-center justify-center rounded-[2rem] bg-white p-6 text-center shadow transition hover:scale-105 ${i % 2 ? "hover:rotate-2" : "hover:-rotate-2"}`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${g.color}`}
                  >
                    {g.src ? (
                      <span
                        aria-hidden
                        className="h-10 w-10 bg-current"
                        style={{
                          maskImage: `url(${g.src})`,
                          WebkitMaskImage: `url(${g.src})`,
                          maskSize: "contain",
                          WebkitMaskSize: "contain",
                          maskRepeat: "no-repeat",
                          WebkitMaskRepeat: "no-repeat",
                          maskPosition: "center",
                          WebkitMaskPosition: "center",
                        }}
                      />
                    ) : (
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-8 w-8 fill-none stroke-current"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {g.icon}
                      </svg>
                    )}
                  </div>
                  <p className="mt-2 font-bold">{g.title}</p>
                </Reveal>
              ))}
            </div>
            <div className="mt-12">
              <h3 className="mb-6 text-center text-2xl font-black sm:text-3xl">
                Na co jsme v minulých letech přispěli
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {GIVING_BY_YEAR.map((entry) => (
                  <article
                    key={entry.year}
                    className="rounded-[1.75rem] bg-white p-6 shadow-sm"
                  >
                    <h4 className="mb-3 text-xl font-black">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="decoration-2 underline-offset-4 hover:underline"
                      >
                        {entry.year}
                        <span className="sr-only">
                          {" "}
                          – podrobnosti na původním webu
                        </span>
                      </a>
                    </h4>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed sm:text-base">
                      {entry.projects.map((project) => (
                        <li key={project}>{project}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
            <div className="mt-8 rounded-[2.5rem] bg-indigo-950 p-8 text-center text-white">
              <p>
                Prosíme o příspěvek min. 200 Kč za rodinu. Hotově třídnímu
                učiteli nebo na klubový účet:
              </p>
              <p
                id="klubovy-ucet"
                className="mt-2 scroll-mt-24 text-4xl font-black text-yellow-300"
              >
                277061076/0300
              </p>
              <p className="text-sm">Uveďte DAR + jméno žáka a třídu.</p>
            </div>
          </div>
          <Wave fill="fill-indigo-950" />
        </section>
      </main>

      <footer
        id="kontakt"
        className="bg-indigo-950 px-4 py-16 text-center text-slate-200"
      >
        <h2 className="mb-4 text-5xl font-black text-white sm:text-7xl">
          Kontakt
        </h2>
        <p>Klub rodičů při MZŠ a MŠ Brno, z.s.</p>
        <p>Zemědělská 29, 613 00 Brno</p>
        <p className="mt-2">
          <a
            className="font-bold text-yellow-300 hover:underline"
            href="mailto:maskolaklub@seznam.cz"
          >
            maskolaklub@seznam.cz
          </a>
        </p>
        <p className="mt-2">
          <a
            className="font-bold text-yellow-300 hover:underline"
            href="https://www.facebook.com/groups/2869762866466630"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebooková skupina
          </a>
        </p>
      </footer>
    </div>
  );
}
