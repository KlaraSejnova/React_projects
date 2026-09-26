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
  photoUrl: string | null;
};

const tripsStorageKey = "portfolio-trips";
const maxPhotoSize = 5 * 1024 * 1024;

// Zobrazí datum výletu v českém tvaru, například 26.9. 2026.
const formatTripDate = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${Number(day)}.${Number(month)}. ${year}`;
};

// Převede řádek ze Supabase (snake_case) na tvar používaný v komponentě (camelCase).
const toTrip = (row: {
  id: number;
  title: string;
  date: string | null;
  description: string;
  map_url: string;
  photo_url: string | null;
}): Trip => ({
  id: row.id,
  title: row.title,
  date: row.date ?? "",
  description: row.description,
  mapUrl: row.map_url,
  photoUrl: row.photo_url,
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
  const [mapUrl, setMapUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    if (photoFile && photoFile.size > maxPhotoSize) {
      setFormError("Fotka může mít maximálně 5 MB.");
      return;
    }

    setIsSaving(true);
    try {
      let nextPhotoUrl = removePhoto ? null : photoUrl;

      if (photoFile) {
        const extension =
          photoFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const photoPath = `${user.id}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("trip-photos")
          .upload(photoPath, photoFile, { contentType: photoFile.type });

        if (uploadError) {
          setFormError(`Fotku se nepodařilo nahrát: ${uploadError.message}`);
          return;
        }

        nextPhotoUrl = supabase.storage
          .from("trip-photos")
          .getPublicUrl(photoPath).data.publicUrl;
      }

      const tripValues = {
        title,
        date: date || null,
        description,
        map_url: mapUrl,
        photo_url: nextPhotoUrl,
      };

      // Podle editingTripId se rozhodne, jestli se výlet vkládá jako nový, nebo aktualizuje.
      const result =
        editingTripId === null
          ? await supabase.from("trips").insert(tripValues).select().single()
          : await supabase
              .from("trips")
              .update(tripValues)
              .eq("id", editingTripId)
              .select()
              .single();

      if (result.error) {
        setFormError(`Výlet se nepodařilo uložit: ${result.error.message}`);
        return;
      }

      const updatedTrips =
        editingTripId === null
          ? [toTrip(result.data), ...trips]
          : trips.map((trip) =>
              trip.id === editingTripId ? toTrip(result.data) : trip,
            );

      setTrips(updatedTrips);
      setTitle("");
      setDate("");
      setDescription("");
      setMapUrl("");
      setPhotoUrl(null);
      setPhotoFile(null);
      setRemovePhoto(false);
      setEditingTripId(null);
    } catch {
      setFormError("Výlet se nepodařilo uložit. Zkus to prosím znovu.");
    } finally {
      setIsSaving(false);
    }
  };

  const editTrip = (trip: Trip) => {
    // Přednastaví formulář hodnotami vybraného výletu a odscrolluje nahořu k formuláři.
    setEditingTripId(trip.id);
    setTitle(trip.title);
    setDate(trip.date);
    setDescription(trip.description);
    setMapUrl(trip.mapUrl);
    setPhotoUrl(trip.photoUrl);
    setPhotoFile(null);
    setRemovePhoto(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingTripId(null);
    setTitle("");
    setDate("");
    setDescription("");
    setMapUrl("");
    setPhotoUrl(null);
    setPhotoFile(null);
    setRemovePhoto(false);
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
              Mapa z Mapy.cz (volitelně)
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
            <div className="wide-field photo-field">
              <label htmlFor="trip-photo">
                Fotka výletu (volitelně, max. 5 MB)
              </label>
              <input
                id="trip-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => {
                  setPhotoFile(event.target.files?.[0] ?? null);
                  setRemovePhoto(false);
                }}
              />
              {photoFile && <small>Vybráno: {photoFile.name}</small>}
              {!photoFile && photoUrl && !removePhoto && (
                <small>
                  Fotka je nahraná. Novým výběrem ji můžeš nahradit.
                </small>
              )}
              {editingTripId !== null && photoUrl && (
                <label className="photo-remove-option">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(event) => setRemovePhoto(event.target.checked)}
                  />
                  Odebrat dosavadní fotku
                </label>
              )}
            </div>
            <div className="form-actions">
              <button
                className="submit-button"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Ukládám..."
                  : editingTripId === null
                    ? "Přidat výlet"
                    : "Uložit úpravy"}
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
              {trip.date && (
                <time dateTime={trip.date}>{formatTripDate(trip.date)}</time>
              )}
              <p>{trip.description}</p>
            </div>
            {trip.photoUrl && (
              <div className="trip-photo">
                <img
                  src={trip.photoUrl}
                  alt={`Fotka z výletu ${trip.title}`}
                  loading="lazy"
                />
              </div>
            )}
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
