import { newsItems } from "@/app/data/home-data";
import { Reveal } from "@/app/components/Visuals";

const headingClass = "text-4xl font-black tracking-tight sm:text-6xl";

export default function NewsSection() {
  return (
    <section id="aktuality" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className={`${headingClass} mb-8 text-center`}>Aktuality</h2>
      <div className="grid gap-5 sm:grid-cols-3">
        {newsItems.map((news, index) => (
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
    </section>
  );
}
