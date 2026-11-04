"use client";

import { useEffect, useState } from "react";
import {
  formatEventDate,
  formatEventTime,
  getSupabaseClient,
  isSupabaseConfigured,
  type EventRecord,
} from "@/app/lib/supabase";

type EventsState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | { status: "ready"; events: EventRecord[] };

function useUpcomingEvents(): EventsState {
  const [state, setState] = useState<EventsState>(() =>
    isSupabaseConfigured()
      ? { status: "loading" }
      : { status: "unconfigured" },
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let active = true;
    void supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setState({ status: "error", message: error.message });
          return;
        }
        setState({ status: "ready", events: data ?? [] });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function HeroUpcomingEvent() {
  const state = useUpcomingEvents();
  const event = state.status === "ready" ? state.events[0] : undefined;

  return (
    <div className="relative mt-8 w-full max-w-xl rounded-[2rem] bg-white/80 p-5 text-left shadow-lg backdrop-blur sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-600">
        Nejbližší akce
      </p>
      {event ? (
        <>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            {event.title}
          </h2>
          <p className="mt-2 font-semibold">
            {formatEventDate(event.starts_at)} v{" "}
            {formatEventTime(event.starts_at)}
          </p>
          {event.location && (
            <p className="mt-1 text-sm font-medium">{event.location}</p>
          )}
        </>
      ) : (
        <p aria-live="polite" className="mt-2 font-semibold">
          {state.status === "loading"
            ? "Načítáme nejbližší akci…"
            : state.status === "unconfigured"
              ? "Kalendář akcí zatím není nastaven."
              : state.status === "error"
                ? `Akci se nepodařilo načíst: ${state.message}`
                : "Žádné další akce zatím nejsou naplánované."}
        </p>
      )}
      <a
        href="#akce"
        className="mt-4 inline-flex rounded-full bg-indigo-950 px-5 py-2 text-sm font-bold text-white transition hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-950"
      >
        Všechny akce
      </a>
    </div>
  );
}

export default function UpcomingEventsSection() {
  const state = useUpcomingEvents();

  return (
    <section id="akce" className="mx-auto max-w-5xl px-4 py-16">
      <h2 className="mb-8 text-center text-4xl font-black tracking-tight sm:text-6xl">
        Kalendář akcí
      </h2>
      {state.status === "loading" ? (
        <p aria-live="polite" className="text-center font-semibold">
          Načítáme naplánované akce…
        </p>
      ) : state.status === "unconfigured" ? (
        <p className="text-center font-semibold">
          Kalendář akcí zatím není nastaven.
        </p>
      ) : state.status === "error" ? (
        <p role="alert" className="text-center font-semibold">
          Akce se nepodařilo načíst: {state.message}
        </p>
      ) : state.events.length === 0 ? (
        <p className="text-center font-semibold">
          Momentálně nejsou naplánované žádné akce.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {state.events.map((event, index) => (
            <li
              key={event.id}
              className={`rounded-[2rem] p-6 shadow-sm ${
                index % 3 === 0
                  ? "bg-pink-500 text-white"
                  : index % 3 === 1
                    ? "bg-sky-300"
                    : "bg-lime-300"
              }`}
            >
              <p className="text-sm font-bold">
                {formatEventDate(event.starts_at)} v{" "}
                {formatEventTime(event.starts_at)}
              </p>
              <h3 className="mt-2 text-2xl font-black leading-tight">
                {event.title}
              </h3>
              {event.location && (
                <p className="mt-2 font-semibold">{event.location}</p>
              )}
              {event.description && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed">
                  {event.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
