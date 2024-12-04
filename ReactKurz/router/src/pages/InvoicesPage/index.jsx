import { Link } from "react-router-dom";

export const InvoicesPage = () => {
  return (
    <div>
      <header>
        <h2>Invoices</h2>
      </header>
      <main>Invoices Page</main>
      <nav>
        <Link to="/">Back</Link>
      </nav>
      <footer>2024</footer>
    </div>
  );
};
