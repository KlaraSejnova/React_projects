import { FormEvent, useEffect, useState } from "react";
import "./trips.css";
import { supabase } from "../lib/supabase";

type Trip = {
  id: number;
  title: string;
  date: string;
  description: string;
  mapUrl: string;
};

const tripsStorageKey = "portfolio-trips";
const defaultMapUrl = "https://mapy.com/s/bavadutama";

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

const Trips = ({ onBack }: { onBack: () => void }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [mapUrl, setMapUrl] = useState(defaultMapUrl);
  const [editingTripId, setEditingTripId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const loadTrips = async () => {
      if (supabase) {
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
    setFormError("");
    const submittedTrip = {
      id: editingTripId ?? Date.now(),
      title,
      date,
      description,
      mapUrl,
    };
    let updatedTrips: Trip[];

    if (supabase) {
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
    } else {
      updatedTrips =
        editingTripId === null
          ? [submittedTrip, ...trips]
          : trips.map((trip) =>
              trip.id === editingTripId ? submittedTrip : trip,
            );
      // Bez backendu ukládáme data pouze lokálně v tomto prohlížeči.
      window.localStorage.setItem(
        tripsStorageKey,
        JSON.stringify(updatedTrips),
      );
    }

    setTrips(updatedTrips);
    setTitle("");
    setDate("");
    setDescription("");
    setMapUrl(defaultMapUrl);
    setEditingTripId(null);
  };

  const editTrip = (trip: Trip) => {
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
    if (!window.confirm("Opravdu chceš tento výlet smazat?")) {
      return;
    }

    setFormError("");

    if (supabase) {
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) {
        setFormError(`Výlet se nepodařilo smazat: ${error.message}`);
        return;
      }
    }

    const updatedTrips = trips.filter((trip) => trip.id !== tripId);
    setTrips(updatedTrips);

    if (!supabase) {
      window.localStorage.setItem(
        tripsStorageKey,
        JSON.stringify(updatedTrips),
      );
    }

    if (editingTripId === tripId) {
      cancelEdit();
    }
  };

  return (
    <main className="trips-page">
      <img
        className="trips-background"
        src="/landscape.svg"
        alt=""
        aria-hidden="true"
      />
      <div className="trips-sticky-navigation">
        <button className="back-button" type="button" onClick={onBack}>
          Zpět na portfolio
        </button>
      </div>
      <h2>Moje výlety</h2>
      <p className="trips-intro">Přidej místo, na které nechceš zapomenout.</p>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

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
          </article>
        ))}
      </section>
    </main>
  );
};

export default Trips;
