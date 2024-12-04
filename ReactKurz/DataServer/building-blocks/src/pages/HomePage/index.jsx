import { MovieList } from "../../components/MovieList";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="container">
      <main>
        <MovieList></MovieList>
      </main>
    </div>
  );
};
