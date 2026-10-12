import "./App.css";
import Profile from "./components/profile";
import Projects from "./components/projects";
import Trips from "./components/trips";
import HomeScreen from "./components/homeScreen";
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
    <HomeScreen
      onProjects={() => setShowProjects(true)}
      onTrips={() => setShowTrips(true)}
      onProfile={() => setShowProfile(true)}
    />
  );
}

export default App;
