import "./navbar.css";

import { NavLink } from "react-router-dom";
function NavbarCompoment() {
  return (
    <nav>
      <div className="container">
        <div className="nav-elements">
          <ul>
            <li>
              <NavLink to="/">Domů</NavLink>
            </li>
            <li>
              <NavLink to="/About">O nás</NavLink>
            </li>
            <li>
              <NavLink to="/Trips">Výlety</NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
export default NavbarCompoment;
