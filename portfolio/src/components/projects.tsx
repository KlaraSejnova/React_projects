import "./projects.css";

type ProjectsProps = {
  onBack: () => void;
  onTrips: () => void;
  onProfile: () => void;
};

const weekdashboardUrl = "https://weekdashboard.netlify.app";
const klubrodicuUrl = "https://klubrodicu.netlify.app";
const bezeckyDenikUrl = "https://bezeckydenik.netlify.app";

const Projects = ({ onBack, onTrips, onProfile }: ProjectsProps) => {
  return (
    <main className="projects-page">
      <img
        className="projects-background"
        src={`${process.env.PUBLIC_URL}/landscape.svg`}
        alt=""
        aria-hidden="true"
      />
      <div className="projects-sticky-navigation">
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
          <button type="button" onClick={onTrips}>
            Moje výlety
          </button>
          <button type="button" onClick={onProfile}>
            O mně
          </button>
        </div>
      </div>

      <header className="projects-header">
        <p className="projects-kicker">Vybrané projekty</p>
        <h1>Co vzniká pod rukama</h1>
        <p>
          Malé aplikace a nápady, které postupně rostou. Tady sdílím projekty,
          na kterých právě pracuji.
        </p>
      </header>

      <section className="project-list" aria-label="Seznam projektů">
        <article className="project-card">
          <div className="project-preview">
            <img
              src={`${process.env.PUBLIC_URL}/weekdashboard.png`}
              alt="Weekdashboard po přihlášení s přehledem úkolů na celý týden"
            />
          </div>
          <div className="project-details">
            <p className="project-number">
              01 / Weekdashboard / osobní projekt
            </p>
            <h2>Týdenní plánovač</h2>
            <p>
              Aplikace pro moje dcery, která slouží k odškrtávání věcí během
              týdne. Pomáhá nám mít přehled o malých každodenních úkolech a
              proměnit jejich plnění v příjemný rituál.
            </p>
            <a
              className="project-link"
              href={weekdashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Otevřít aplikaci
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
        <article className="project-card">
          <div className="project-preview">
            <img
              src={`${process.env.PUBLIC_URL}/klubrodicu.png`}
              alt="Screenshot úvodní stránky webu Klubu rodičů při MZŠ a MŠ Brno"
            />
          </div>
          <div className="project-details">
            <p className="project-number">02 / Klub rodičů / školní projekt</p>
            <h2>Klub rodičů</h2>
            <p>
              Web Klubu rodičů při MZŠ a MŠ Brno, který přibližuje jeho činnost,
              školní akce a možnosti, jak se zapojit.
            </p>
            <a
              className="project-link"
              href={klubrodicuUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Otevřít web
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
        <article className="project-card">
          <div className="project-preview running-preview">
            <img
              className="running-preview-map"
              src={`${process.env.PUBLIC_URL}/bezecky-denik-topographic-map.svg`}
              alt="Topografická mapa s trasou běhu z přihlašovací stránky běžeckého deníku"
            />
            <svg
              className="running-preview-route"
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 520 230"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="running-preview-route-gradient" x1="58" y1="167" x2="447" y2="49" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#48bfff" />
                  <stop offset="1" stopColor="#f2bf4b" />
                </linearGradient>
              </defs>
              <path className="running-preview-route-shadow" d="M58 167c55-3 40-53 93-47 34 4 25 36 66 29 35-6 28-50 67-56 44-7 54 28 90 9 23-12 33-37 73-53" />
              <path className="running-preview-route-path" d="M58 167c55-3 40-53 93-47 34 4 25 36 66 29 35-6 28-50 67-56 44-7 54 28 90 9 23-12 33-37 73-53" />
              <circle cx="58" cy="167" r="7" fill="#202426" stroke="#8bd8ff" strokeWidth="3" />
              <circle cx="447" cy="49" r="7" fill="#f2bf4b" stroke="#ffedb2" strokeWidth="3" />
            </svg>
            <a
              className="running-preview-map-credit"
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
            >
              © OpenStreetMap contributors · Elevation: Mapzen Terrain
            </a>
            <div className="running-preview-caption">
              <span className="running-preview-caption-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="m13.5 5.5 2-2 2 2" />
                  <path d="M15.5 3.5v5a3 3 0 0 1-3 3h-2a3 3 0 0 0-3 3v6" />
                  <circle cx="7.5" cy="5.5" r="2" />
                  <path d="m12 13 3 2 3-1" />
                </svg>
              </span>
              <span><strong>Každý kilometr se počítá</strong><small>Tvá cesta, tvé tempo.</small></span>
            </div>
          </div>
          <div className="project-details">
            <p className="project-number">
              03 / Běžecký deník / osobní projekt
            </p>
            <h2>Běžecký deník</h2>
            <p>
              Osobní přehled běžeckých tréninků s importem z Google Fit,
              porovnáváním GPS tras a bezpečnou synchronizací mezi zařízeními.
            </p>
            <a
              className="project-link"
              href={bezeckyDenikUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Otevřít běžecký deník
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      </section>
    </main>
  );
};

export default Projects;
