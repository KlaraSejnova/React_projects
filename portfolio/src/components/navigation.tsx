import "./navigation.css";
const Navigation = ({ onTrips }: { onTrips: () => void }) => {
  return (
    <nav className="container-navigation">
      <div className="navigation-items">Projects</div>
      <div className="navigation-items">
        <button type="button" onClick={onTrips}>
          Moje výlety
        </button>
      </div>
      <div className="navigation-items">Contact</div>
      <div className="navigation-items">
        <a href="KlaraSejnovaCV.pdf" download>
          CV
        </a>
      </div>
    </nav>
  );
};
export default Navigation;
