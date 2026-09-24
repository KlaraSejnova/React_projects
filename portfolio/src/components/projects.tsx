import "./projects.css";

type ProjectsProps = {
  onBack: () => void;
  onTrips: () => void;
  onProfile: () => void;
};

const weekdashboardUrl = "https://weekdashboard.netlify.app";

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
          Malé aplikace a nápady, které postupně rostou. Tady se budou projekty
          časem přidávat.
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
      </section>
    </main>
  );
};

export default Projects;
