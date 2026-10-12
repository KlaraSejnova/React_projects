import Link from "next/link";
import PhotoArchive from "../photo-archive";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#fff4e0] px-4 pb-16 text-indigo-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full bg-indigo-950 px-5 py-2.5 font-bold text-yellow-300 transition hover:bg-pink-500 hover:text-white"
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 transition group-hover:-translate-x-1 group-hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" fill="none" className="size-4">
              <path
                d="M19.5 12h-14m6 6-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          Zpět na hlavní stránku
        </Link>
        <span className="hidden font-black sm:inline">Klub rodičů</span>
      </header>

      <section className="mx-auto max-w-5xl pt-8">
        <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-pink-600">
          Klub rodičů při MZŠ a MŠ Brno
        </p>
        <h1 className="mt-3 text-center text-5xl font-black tracking-tight sm:text-7xl">
          Fotogalerie
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg leading-relaxed">
          Vzpomínky na společné akce, tvoření a školní rok. Vyberte si rok nebo
          konkrétní akci.
        </p>

        <div className="mt-10 rounded-[2rem] bg-white/60 p-4 shadow-sm sm:p-8">
          <PhotoArchive />
        </div>
      </section>
    </main>
  );
}
