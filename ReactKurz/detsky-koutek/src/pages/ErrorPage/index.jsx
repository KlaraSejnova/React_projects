import { Link } from "react-router-dom";
import "./style.css";

export const ErrorPage = () => {
  return (
    <div className="error-container">
      <main>
        My error page go back to <Link to="/">HomePage</Link>
      </main>
    </div>
  );
};
