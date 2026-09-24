import { FormEvent, useEffect, useState } from "react";
import "./trips.css";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";

// Jeden výlet, jak je uložený v UI (mapUrl místo sloupce map_url z databáze).
type Trip = {
  id: number;
  title: string;
  date: string;
  description: string;
  mapUrl: string;
};

const tripsStorageKey = "portfolio-trips";
const defaultMapUrl = "https://mapy.com/s/bavadutama";

// Převede řádek ze Supabase (snake_case) na tvar používaný v komponentě (camelCase).
const toTrip = (row: {
  id: number;
  title: string;
  date: string | null;
  description: string;
  map_url: string;
}): Trip => ({
  id: row.id,
  title: row.title,
  date: row.date ?? "",
  description: row.description,
  mapUrl: row.map_url,
});

// Stránka výletů: přihlášení přes Supabase umožňuje přidávat/upravovat/mazat výlety.
// Bez Supabase konfigurace se použije jen čtení z localStorage (bez editace).
const Trips = ({
  onBack,
  onProfile,
  onProjects,
}: {
  onBack: () => void;
  onProfile: () => void;
  onProjects: () => void;
}) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mapUrl, setMapUrl] = useState(defaultMapUrl);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let mounted = true;
    // Zjistí, jestli je uživatel už přihlášený, a dál poslouchá změny přihlášení.
    const loadSession = async () => {
      const { data } = await client.auth.getSession();
      if (mounted) {
        setUser(data.session?.user ?? null);
        setAuthLoading(false);
      }
    };

    loadSession();
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadTrips = async () => {
      if (supabase) {
        // Při připojené Supabase se výlety načítají z databáze, seřazené od nejnovějšího.
        const { data, error } = await supabase
          .from("trips")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          setFormError(`Výlety se nepodařilo načíst: ${error.message}`);
        } else {
          setTrips(data.map(toTrip));
        }
        return;
      }

      // Bez konfigurace Supabase zůstane dostupné lokální ukládání.
      const savedTrips = window.localStorage.getItem(tripsStorageKey);
      if (savedTrips) {
        setTrips(JSON.parse(savedTrips));
      }
    };

    loadTrips();
  }, []);

  const addTrip = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) {
      return;
    }
    setFormError("");
    let updatedTrips: Trip[];

    // Podle editingTripId se rozhodne, jestli se výlet vkládá jako nový, nebo aktualizuje.
    const result =
      editingTripId === null
        ? await supabase
            .from("trips")
            .insert({
              title,
              date: date || null,
              description,
              map_url: mapUrl,
            })
            .select()
            .single()
        : await supabase
            .from("trips")
            .update({
              title,
              date: date || null,
              description,
              map_url: mapUrl,
            })
            .eq("id", editingTripId)
            .select()
            .single();

    if (result.error) {
      setFormError(`Výlet se nepodařilo uložit: ${result.error.message}`);
      return;
    }

    updatedTrips =
      editingTripId === null
        ? [toTrip(result.data), ...trips]
        : trips.map((trip) =>
            trip.id === editingTripId ? toTrip(result.data) : trip,
          );

    setTrips(updatedTrips);
    setTitle("");
    setDate("");
    setDescription("");
    setMapUrl(defaultMapUrl);
    setEditingTripId(null);
  };

  const editTrip = (trip: Trip) => {
    // Přednastaví formulář hodnotami vybraného výletu a odscrolluje nahořu k formuláři.
    setEditingTripId(trip.id);
    setTitle(trip.title);
    setDate(trip.date);
    setDescription(trip.description);
    setMapUrl(trip.mapUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingTripId(null);
    setTitle("");
    setDate("");
    setDescription("");
    setMapUrl(defaultMapUrl);
  };

  const deleteTrip = async (tripId: number) => {
    if (!supabase || !user) {
      return;
    }

    // Potvrzovací dialog brání náhodnému smazání výletu.
    if (!window.confirm("Opravdu chceš tento výlet smazat?")) {
      return;
    }

    setFormError("");

    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      setFormError(`Výlet se nepodařilo smazat: ${error.message}`);
      return;
    }

    const updatedTrips = trips.filter((trip) => trip.id !== tripId);
    setTrips(updatedTrips);

    if (editingTripId === tripId) {
      cancelEdit();
    }
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    setAuthError("");
    if (!email.trim() || !password) {
      setAuthError("Vyplň e-mail i heslo.");
      return;
    }

    setIsSigningIn(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsSigningIn(false);
    if (error) {
      setAuthError("Přihlášení se nepodařilo. Zkontroluj e-mail a heslo.");
      return;
    }

    setPassword("");
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    cancelEdit();
  };

  return (
    <main className="trips-page">
      <img
        className="trips-background"
        src={`${process.env.PUBLIC_URL}/landscape.svg`}
        alt=""
        aria-hidden="true"
      />
      <div className="trips-sticky-navigation">
        <button
          className="home-link"
          type="button"
          onClick={onBack}
          aria-label="Zpět na úvodní stránku"
        >
          <img
            src={`${process.env.PUBLIC_URL}/favicon.svg`}
            alt=""
            aria-hidden="true"
          />
        </button>
        <div className="sticky-nav-links">
          <button type="button" onClick={onProfile}>
            O mně
          </button>
          <button type="button" onClick={onProjects}>
            Projekty
          </button>
        </div>
      </div>
      <h2>Moje výlety</h2>
      <p className="trips-intro">Přidej místo, na které nechceš zapomenout.</p>
      {/* Bez přihlášení se zobrazí jen přihlašovací formulář, ne editace výletů. */}
      {!authLoading && !user && supabase && (
        <form className="auth-form" onSubmit={signIn} noValidate>
          <h3>Přihlášení pro správu výletů</h3>
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label>
            Heslo
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {authError && (
            <p className="form-error" role="alert">
              {authError}
            </p>
          )}
          <button
            className="submit-button"
            type="submit"
            disabled={isSigningIn}
          >
            {isSigningIn ? "Přihlašuji..." : "Přihlásit se"}
          </button>
        </form>
      )}
      {!authLoading && !user && !supabase && (
        <p className="form-error" role="alert">
          Správa výletů je dostupná po připojení Supabase.
        </p>
      )}
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      {user && (
        <>
          <div className="auth-status">
            <span>Přihlášeno: {user.email}</span>
            <button className="cancel-button" type="button" onClick={signOut}>
              Odhlásit se
            </button>
          </div>
          <form className="trip-form" onSubmit={addTrip}>
            <label>
              Název výletu
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <label>
              Datum
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="wide-field">
              Popis
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
              />
            </label>
            <label className="wide-field">
              Vložit mapu z Mapy.cz
              <input
                type="url"
                placeholder="URL z možnosti Vložit mapu"
                value={mapUrl}
                onChange={(event) => setMapUrl(event.target.value)}
              />
              <small>
                Použij odkaz pro vložení mapy, ne běžný odkaz z adresního řádku
                Mapy.cz.
              </small>
            </label>
            <div className="form-actions">
              <button className="submit-button" type="submit">
                {editingTripId === null ? "Přidat výlet" : "Uložit úpravy"}
              </button>
              {editingTripId !== null && (
                <button
                  className="cancel-button"
                  type="button"
                  onClick={cancelEdit}
                >
                  Zrušit úpravu
                </button>
              )}
            </div>
          </form>
        </>
      )}

      <section className="trip-list" aria-live="polite">
        {trips.map((trip) => (
          <article className="trip-item" key={trip.id}>
            <div className="trip-content">
              <h3>{trip.title}</h3>
              {trip.date && <time>{trip.date}</time>}
              <p>{trip.description}</p>
            </div>
            {trip.mapUrl && (
              <div className="trip-map">
                {/* Vložená mapa z Mapy.cz pomocí odkazu "Vložit mapu". */}
                <iframe
                  src={trip.mapUrl}
                  title={`Mapa výletu ${trip.title}`}
                  loading="lazy"
                  frameBorder="0"
                  allowFullScreen
                />
                <a href={trip.mapUrl} target="_blank" rel="noopener noreferrer">
                  Otevřít mapu ve větším okně
                </a>{" "}
              </div>
            )}
            {user && (
              <div className="trip-actions">
                <button
                  className="edit-button"
                  type="button"
                  onClick={() => editTrip(trip)}
                >
                  Upravit výlet
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTrip(trip.id)}
                >
                  Smazat výlet
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
};

export default Trips;
