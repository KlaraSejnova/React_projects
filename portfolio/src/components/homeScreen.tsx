type HomeScreenProps = {
  onProjects: () => void;
  onTrips: () => void;
  onProfile: () => void;
};

export default function HomeScreen({
  onProjects,
  onTrips,
  onProfile,
}: HomeScreenProps) {
  return (
    <div className="App">
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
        <nav className="landscape-navigation" aria-label="Hlavní navigace">
          <button
            className="landscape-hill hill-projects"
            type="button"
            onClick={onProjects}
          >
            <span>Projects</span>
          </button>
          <button
            className="landscape-hill hill-trips"
            type="button"
            onClick={onTrips}
          >
            <span>Moje výlety</span>
          </button>
          <button
            className="landscape-hill hill-contact"
            type="button"
            onClick={onProfile}
          >
            <span>O mně</span>
          </button>
        </nav>
      </header>
    </div>
  );
}
