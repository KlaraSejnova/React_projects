"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  formatEventDate,
  formatEventTime,
  getSupabaseClient,
  isSupabaseConfigured,
  type EventRecord,
} from "@/app/lib/supabase";

type AdminStatus =
  | "checking"
  | "unconfigured"
  | "signed-out"
  | "forbidden"
  | "ready"
  | "error";

type EventForm = {
  title: string;
  startsAt: string;
  location: string;
  description: string;
  isPublished: boolean;
};

const emptyForm: EventForm = {
  title: "",
  startsAt: "",
  location: "",
  description: "",
  isPublished: true,
};

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function EventsAdmin() {
  const [status, setStatus] = useState<AdminStatus>(() =>
    isSupabaseConfigured() ? "checking" : "unconfigured",
  );
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadEvents = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }

    setEvents(data ?? []);
    setStatus("ready");
  }, []);

  const checkAdminAccess = useCallback(
    async (userId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data, error } = await supabase
      .from("event_admins")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
      return;
    }
    if (!data) {
      setStatus("forbidden");
      return;
    }

    await loadEvents();
    },
    [loadEvents],
  );

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      if (!data.session) {
        setStatus("signed-out");
        return;
      }
      void checkAdminAccess(data.session.user.id);
    });

    return () => {
      active = false;
    };
  }, [checkAdminAccess]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    setBusy(true);
    setErrorMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await checkAdminAccess(data.user.id);
  }

  function startEditing(event: EventRecord) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      startsAt: toLocalDateTime(event.starts_at),
      location: event.location ?? "",
      description: event.description ?? "",
      isPublished: event.is_published,
    });
    setMessage("");
    setErrorMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }
    if (!form.title.trim()) {
      setErrorMessage("Zadejte název akce.");
      return;
    }
    if (!form.startsAt || Number.isNaN(new Date(form.startsAt).getTime())) {
      setErrorMessage("Zadejte platné datum a čas akce.");
      return;
    }

    setBusy(true);
    setMessage("");
    setErrorMessage("");
    const eventData = {
      title: form.title.trim(),
      starts_at: new Date(form.startsAt).toISOString(),
      location: form.location.trim() || null,
      description: form.description.trim() || null,
      is_published: form.isPublished,
    };
    const result = editingId
      ? await supabase.from("events").update(eventData).eq("id", editingId)
      : await supabase.from("events").insert(eventData);
    setBusy(false);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(editingId ? "Akce byla upravena." : "Akce byla přidána.");
    resetForm();
    await loadEvents();
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Opravdu chcete tuto akci smazat?")) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }

    setBusy(true);
    setMessage("");
    setErrorMessage("");
    const { error } = await supabase.from("events").delete().eq("id", id);
    setBusy(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setMessage("Akce byla smazána.");
    if (editingId === id) resetForm();
    await loadEvents();
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setEvents([]);
    setStatus("signed-out");
  }

  return (
    <main className="min-h-screen bg-[#fff4e0] px-4 py-10 text-indigo-950 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="font-bold underline underline-offset-4 focus-visible:outline"
        >
          ← Zpět na web
        </Link>
        <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
          Správa akcí
        </h1>

        {status === "checking" && (
          <p className="mt-6" aria-live="polite">
            Ověřujeme přihlášení…
          </p>
        )}

        {status === "unconfigured" && (
          <p className="mt-6 rounded-2xl bg-orange-200 p-5">
            Připojení k Supabase není nastavené. Doplňte veřejné proměnné
            Supabase a spusťte znovu sestavení webu.
          </p>
        )}

        {status === "signed-out" && (
          <form
            onSubmit={signIn}
            className="mt-8 max-w-md space-y-4 rounded-3xl bg-white p-6 shadow"
          >
            <p className="font-semibold">
              Přihlaste se účtem správce akcí.
            </p>
            <label className="block font-semibold">
              E-mail
              <input
                name="email"
                type="email"
                required
                autoComplete="username"
                className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
              />
            </label>
            <label className="block font-semibold">
              Heslo
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-indigo-950 px-6 py-3 font-bold text-white disabled:opacity-60"
            >
              {busy ? "Přihlašování…" : "Přihlásit se"}
            </button>
            {errorMessage && (
              <p role="alert" className="text-sm text-red-700">
                Přihlášení se nezdařilo: {errorMessage}
              </p>
            )}
          </form>
        )}

        {status === "forbidden" && (
          <div className="mt-6 rounded-2xl bg-orange-200 p-5">
            Tento účet nemá oprávnění spravovat akce. Přihlaste se účtem
            správce.
            <button
              type="button"
              onClick={signOut}
              className="ml-3 font-bold underline"
            >
              Odhlásit
            </button>
          </div>
        )}

        {status === "error" && (
          <p role="alert" className="mt-6 rounded-2xl bg-red-100 p-5">
            Chyba při načítání správy akcí: {errorMessage}
          </p>
        )}

        {status === "ready" && (
          <>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={signOut}
                className="rounded-full border-2 border-indigo-950 px-5 py-2 font-bold"
              >
                Odhlásit se
              </button>
            </div>

            <form
              onSubmit={saveEvent}
              className="mt-4 grid gap-4 rounded-3xl bg-white p-6 shadow sm:grid-cols-2"
            >
              <h2 className="text-2xl font-black sm:col-span-2">
                {editingId ? "Upravit akci" : "Přidat akci"}
              </h2>
              <label className="font-semibold sm:col-span-2">
                Název akce
                <input
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
                />
              </label>
              <label className="font-semibold">
                Datum a čas
                <input
                  required
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(event) =>
                    setForm({ ...form, startsAt: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
                />
              </label>
              <label className="font-semibold">
                Místo
                <input
                  maxLength={200}
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
                />
              </label>
              <label className="font-semibold sm:col-span-2">
                Popis
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-indigo-950/20 px-4 py-3"
                />
              </label>
              <label className="flex items-center gap-3 font-semibold sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm({ ...form, isPublished: event.target.checked })
                  }
                  className="size-5 accent-indigo-950"
                />
                Zveřejnit v kalendáři
              </label>
              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-indigo-950 px-6 py-3 font-bold text-white disabled:opacity-60"
                >
                  {busy ? "Ukládání…" : editingId ? "Uložit změny" : "Přidat akci"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border-2 border-indigo-950 px-6 py-3 font-bold"
                  >
                    Zrušit úpravy
                  </button>
                )}
              </div>
              {message && (
                <p role="status" className="sm:col-span-2">
                  {message}
                </p>
              )}
              {errorMessage && (
                <p role="alert" className="sm:col-span-2 text-red-700">
                  {errorMessage}
                </p>
              )}
            </form>

            <section className="mt-10">
              <h2 className="text-2xl font-black">Všechny akce</h2>
              {events.length === 0 ? (
                <p className="mt-3">Zatím jste nepřidali žádné akce.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {events.map((event) => (
                    <li
                      key={event.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {formatEventDate(event.starts_at)} v{" "}
                          {formatEventTime(event.starts_at)}
                          {!event.is_published && " · skrytá"}
                        </p>
                        <h3 className="mt-1 text-xl font-black">
                          {event.title}
                        </h3>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(event)}
                          className="rounded-full border-2 border-indigo-950 px-4 py-2 font-bold"
                        >
                          Upravit
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void deleteEvent(event.id)}
                          className="rounded-full bg-red-100 px-4 py-2 font-bold text-red-900 disabled:opacity-60"
                        >
                          Smazat
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
