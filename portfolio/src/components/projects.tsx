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
              src={`${process.env.PUBLIC_URL}/bezecky-denik-preview.png`}
              alt="Náhled přihlašovací stránky běžeckého deníku: vrstevnicová mapa s trasou a popiskem „Každý kilometr se počítá. Tvá cesta, tvé tempo.“"
            />
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
