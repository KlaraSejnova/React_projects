import "./App.css";
import Profile from "./components/profile";
import Projects from "./components/projects";
import Trips from "./components/trips";
import { useState } from "react";

// Kořenová komponenta portfolia: přepíná mezi úvodní stránkou, výlety a profilem.
function App() {
  const [showTrips, setShowTrips] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  // Místo routeru se zde jednoduše přepínají tři obrazovky podle lokálního stavu.
  if (showTrips) {
    return (
      <Trips
        onBack={() => setShowTrips(false)}
        onProfile={() => {
          setShowTrips(false);
          setShowProfile(true);
        }}
        onProjects={() => {
          setShowTrips(false);
          setShowProjects(true);
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
        onProjects={() => {
          setShowProfile(false);
          setShowProjects(true);
        }}
      />
    );
  }

  if (showProjects) {
    return (
      <Projects
        onBack={() => setShowProjects(false)}
        onTrips={() => {
          setShowProjects(false);
          setShowTrips(true);
        }}
        onProfile={() => {
          setShowProjects(false);
          setShowProfile(true);
        }}
      />
    );
  }

  return (
    <div className="App">
      {/* SVG filtr dává pozadí akvarelový vzhled (šum + posun barev). */}
      <svg className="landscape-filters" aria-hidden="true">
        <defs>
          <filter id="watercolor" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".016"
              numOctaves="3"
              seed="8"
              result="paper"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="paper"
              scale="11"
              xChannelSelector="R"
              yChannelSelector="G"
              result="wash"
            />
            <feGaussianBlur in="wash" stdDeviation=".2" />
          </filter>
        </defs>
      </svg>
      <img
        className="landscape-background"
        src={`${process.env.PUBLIC_URL}/landscape.svg`}
        alt=""
        aria-hidden="true"
      />
      <header className="App-header">
        <h1>Portfolio Klára Šejnová</h1>
        <p className="landscape-intro">Vyber si kopeček a objev další cestu.</p>
        {/* Tři "kopečky" přepínají mezi obrazovkami portfolia. */}
        <nav className="landscape-navigation" aria-label="Hlavní navigace">
          <button
            className="landscape-hill hill-projects"
            type="button"
            onClick={() => setShowProjects(true)}
          >
            <span>Projects</span>
          </button>
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
