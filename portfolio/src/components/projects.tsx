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
          <div
            className="project-preview running-preview"
            role="img"
            aria-label="Ukázka běžeckého deníku s přehledem běhů a GPS tras"
          >
            <div className="running-preview-panel">
              <p>BĚŽECKÝ DENÍK</p>
              <strong>Moje běhy</strong>
              <div className="running-preview-stats">
                <span>Celkem<br /><b>128 km</b></span>
                <span>Aktivity<br /><b>16 běhů</b></span>
              </div>
              <svg viewBox="0 0 360 112" aria-hidden="true">
                <path d="M8 92 44 77l34 8 39-41 35 17 34-32 31 15 31-23 32 19 42-29 30 16" />
                <path className="running-preview-route" d="M28 34c8-16 30-10 27 5-2 10-16 12-10 23 5 10 20 3 26 15 7 15-13 24-22 14-7-8 1-19 13-22 15-4 23 14 35 6 13-9 4-28 18-31 13-3 15 16 28 14 11-2 13-19 26-18 15 1 11 20 24 24 13 3 20-13 33-7 12 5 3 21 15 27 12 5 20-8 31-3 8 4 7 15 18 16" />
              </svg>
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
