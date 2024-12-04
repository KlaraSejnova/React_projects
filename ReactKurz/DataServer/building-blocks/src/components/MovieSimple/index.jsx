import "./styles.css";
import { MovieDetailWithLoad } from "../MovieDetailWithLoad";
import { useState } from "react";

export const MovieSimple = ({ movie }) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className="movie-container">
      <span className="movie-title">{movie.title}</span>
      <span>({movie.year})</span>
      <div className="movie-genres">
        {movie.genres.map((i) => (
          <span key={i.id} className="movie-genre">
            {i}
          </span>
        ))}
      </div>
      <button onClick={() => setOpened(!opened)}>Show/Hide</button>
      <MovieDetailWithLoad opened={opened} id={movie.id}></MovieDetailWithLoad>
    </div>
  );
};
