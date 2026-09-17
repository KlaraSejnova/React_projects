import "./App.css";
import Profile from "./components/profile";
import Trips from "./components/trips";
import { useState } from "react";

function App() {
  const [showTrips, setShowTrips] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  if (showTrips) {
    return (
      <Trips
        onBack={() => setShowTrips(false)}
        onProfile={() => {
          setShowTrips(false);
          setShowProfile(true);
        }}
      />
    );
  }

  if (showProfile) {
    return (
      <Profile
        onBack={() => setShowProfile(false)}
        onTrips={() => {
          setShowProfile(false);
          setShowTrips(true);
        }}
      />
    );
  }

  return (
    <div className="App">
      <img
        className="landscape-background"
        src="/landscape.svg"
        alt=""
        aria-hidden="true"
      />
      <header className="App-header">
        <h1>Portfolio Klára Šejnová</h1>
        <p className="landscape-intro">Vyber si kopeček a objev další cestu.</p>
        <nav className="landscape-navigation" aria-label="Hlavní navigace">
          <a
            className="landscape-hill hill-projects"
            href="https://github.com/petrsynek/rodina"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Projects</span>
          </a>
          <button
            className="landscape-hill hill-trips"
            type="button"
            onClick={() => setShowTrips(true)}
          >
            <span>Moje výlety</span>
          </button>
          <button
            className="landscape-hill hill-contact"
            type="button"
            onClick={() => setShowProfile(true)}
          >
            <span>O mně</span>
          </button>
        </nav>
      </header>
    </div>
  );
}

export default App;
