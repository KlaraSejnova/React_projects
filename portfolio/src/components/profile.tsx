import "./profile.css";

const projectsUrl = "https://weekdashboard.netlify.app";

type ProfileProps = {
  onBack: () => void;
  onTrips: () => void;
};

// Seznam dovedností zobrazených jako štítky v sekci Skills.
const skills = [
  "JavaScript",
  "TypeScript",
  "HTML & CSS & SASS",
  "Bootstrap",
  "Git & Bitbucket",
  "Python",
  "PHP",
  "Linux",
  "Fortran",
];

// Stránka "O mně": životopis s kontaktem, dovednostmi, praxi a vzděláním.
const Profile = ({ onBack, onTrips }: ProfileProps) => {
  return (
    <main className="profile-page">
      <img
        className="profile-background"
        src={`${process.env.PUBLIC_URL}/landscape.svg`}
        alt=""
        aria-hidden="true"
      />
      <div className="profile-sticky-navigation">
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
          <a href={projectsUrl} target="_blank" rel="noopener noreferrer">
            Projekty
          </a>
        </div>
      </div>

      <header className="profile-header">
        <div>
          <p className="profile-kicker">Web developer · Astrophysicist</p>
          <h1>Klára Šejnová</h1>
          <p className="profile-location">Brno, Czech Republic</p>
        </div>
        <div className="profile-contact">
          <a href="tel:+420724969646">+420 724 969 646</a>
          <a href="mailto:k.sejnova@gmail.com">k.sejnova@gmail.com</a>
          <a
            href="https://weekdashboard.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            weekdashboard.netlify.app
          </a>
          <a
            href="https://www.linkedin.com/in/klara-sejnova"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/klara-sejnova
          </a>
        </div>
      </header>

      <section className="profile-introduction profile-section">
        <h2>Who am I?</h2>
        <p>
          After graduating my PhD studies in Astrophysics I became a web
          developer. As an intern in SolarWinds I learned new things and worked
          my way up from content development to WordPress development, creating
          new blocks and components. I am familiar with Jira and Confluence, and
          use GitHub and Bitbucket for collaboration.
        </p>
        <p>
          Recently I have been working at Papirfly as a Template Developer using
          TypeScript and as a Frontend Developer creating banners with HTML,
          SASS and JavaScript.
        </p>
      </section>

      <section className="profile-section">
        <h2>Skills</h2>
        <div className="skill-list">
          {skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Experience</h2>
        <div className="profile-timeline">
          {/* Každý řádek časové osy vykresluje sdílená komponenta ProfileItem níže. */}
          <ProfileItem
            year="2023"
            title="Junior Frontend Developer"
            place="Papirfly"
            detail="TypeScript / HTML / SASS / Bitbucket / Template Development / npm / Jira / FogBugz / After Effect / Adobe Illustrator"
          />
          <ProfileItem
            year="2022–2023"
            title="Web Developer"
            place="SolarWinds"
            detail="HTML / CSS / SASS / JavaScript / Adobe Target / Jira / Sitecore / WordPress / GitHub / PHP / Docker / npm"
          />
          <ProfileItem
            year="2010–2021"
            title="Research Scientist"
            place="Masaryk University"
            detail="Spectral analysis / Fortran / Genetic Algorithm / Pikaia / Gnuplot / Python"
          />
          <ProfileItem
            year="2015–2021"
            title="Maternity and Family Leave"
            place="Home"
            detail="Children"
          />
          <ProfileItem
            year="2010–2015"
            title="PhD Student"
            place="Academy of Sciences in Ondřejov"
            detail="Computer modeling of Be stars / Fortran / genetic algorithms / Python"
          />
        </div>
      </section>

      <section className="profile-section">
        <h2>Education</h2>
        <div className="profile-timeline">
          <ProfileItem
            year="2010–2021"
            title="Doctoral Degree"
            place="Masaryk University"
            detail="Theoretical Physics and Astrophysics · Dynamical Evolution of Be stars disks"
          />
          <ProfileItem
            year="2007–2010"
            title="Master's Degree"
            place="Masaryk University"
            detail="Theoretical Physics and Astrophysics · Shell modelling of the Be stars"
          />
          <ProfileItem
            year="2004–2007"
            title="Bachelor's Degree"
            place="Masaryk University"
            detail="Theoretical Physics and Astrophysics · Modelling of time behaviour of shell around the Be star 60 Cyg"
          />
          <ProfileItem
            year="Fall 2009"
            title="Exchange semester"
            place="Universitetet i Oslo"
            detail="EEA and Norwegian grants"
          />
        </div>
      </section>

      <div className="profile-columns">
        <section className="profile-section">
          <h2>Languages</h2>
          <p>
            <strong>Czech</strong> · native
          </p>
          <p>
            <strong>English</strong> · proficient
          </p>
          <p>
            <strong>French</strong> · rudimentary
          </p>
          <p>
            <strong>Norwegian (Bokmål)</strong> · rudimentary
          </p>
        </section>
        <section className="profile-section">
          <h2>Hobbies</h2>
          <p>
            Astronomy, programming, art, hiking, climbing, IronMan and baking
            bread.
          </p>
        </section>
      </div>
    </main>
  );
};

// Jeden řádek v časové ose (praxe/vzdělání): rok, název, popis a místo.
const ProfileItem = ({
  year,
  title,
  place,
  detail,
}: {
  year: string;
  title: string;
  place: string;
  detail: string;
}) => (
  <article className="profile-item">
    <time>{year}</time>
    <div>
      <h3>{title}</h3>
      <p>{detail}</p>
    </div>
    <strong>{place}</strong>
  </article>
);

export default Profile;
