import KineticWord from "./KineticWord";
import { Wave } from "@/app/components/Visuals";

export default function HeroSection() {
  return (
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
  );
}
