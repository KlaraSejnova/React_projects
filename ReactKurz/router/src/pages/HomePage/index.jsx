import { Link } from "react-router-dom";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="container">
      <header>
        <div className="logo" />
        <h1>Accounting</h1>
      </header>
      <main>
        <nav>
          <Link to="/invoices">Invoices </Link>
          <span>|</span>
          <Link to="/expenses">Expenses </Link>
        </nav>
      </main>
      <footer>
        <p>Czechitas, Digitální akademie: Web</p>
      </footer>
    </div>
  );
};
