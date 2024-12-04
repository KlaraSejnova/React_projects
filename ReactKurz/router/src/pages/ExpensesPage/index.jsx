import { Link } from "react-router-dom";

export const ExpensesPage = () => {
  return (
    <div>
      <header>
        <h2>Expenses</h2>
      </header>
      <main>Expenses Page</main>
      <nav>
        <Link to="/">Back</Link>
      </nav>
      <footer>2024</footer>
    </div>
  );
};
