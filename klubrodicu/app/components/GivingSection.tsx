import { givingByYear, givingItems } from "@/app/data/home-data";
import { Reveal, Wave } from "@/app/components/Visuals";

const headingClass = "text-4xl font-black tracking-tight sm:text-6xl";

export default function GivingSection() {
  return (
    <section id="prispivame" className="relative bg-lime-300 px-4 py-24">
      <Wave fill="fill-[#fff4e0]" top />
      <div className="mx-auto max-w-5xl">
        <h2 className={`${headingClass} mb-2 text-center`}>Přispíváme</h2>
        <p className="mb-8 text-center font-medium">
          Dary rodičů pomáhají škole a žákům všech ročníků.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {givingItems.map((giving, index) => (
            <Reveal
              key={giving.title}
              className={`flex flex-col items-center justify-center rounded-[2rem] bg-white p-6 text-center shadow transition hover:scale-105 ${index % 2 ? "hover:rotate-2" : "hover:-rotate-2"}`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full ${giving.color}`}
              >
                {giving.src ? (
                  <span
                    aria-hidden
                    className="h-10 w-10 bg-current"
                    style={{
                      maskImage: `url(${giving.src})`,
                      WebkitMaskImage: `url(${giving.src})`,
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
                    {giving.icon}
                  </svg>
                )}
              </div>
              <p className="mt-2 font-bold">{giving.title}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <h3 className="mb-6 text-center text-2xl font-black sm:text-3xl">
            Na co jsme v minulých letech přispěli
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {givingByYear.map((entry) => (
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
            Prosíme o příspěvek min. 200 Kč za rodinu. Hotově třídnímu učiteli
            nebo na klubový účet:
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
  );
}
