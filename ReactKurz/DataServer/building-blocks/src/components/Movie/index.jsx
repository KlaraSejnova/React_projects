import { useEffect, useState } from "react";
import "./styles.css";
import { MovieDetail } from "../MovieDetail";
import { MovieDetailWithLoad } from "../MovieDetailWithLoad";

export const Movie = ({ id }) => {
  const [movie, setMovie] = useState();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`http://localhost:3000/movies/${id}`);
      const data = await response.json();
      setMovie(data);
    };
    loadData();
  }, []);

  if (!movie) {
    return <div>Loading...</div>;
  } else {
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
        <MovieDetailWithLoad
          opened={opened}
          id={movie.id}
        ></MovieDetailWithLoad>
      </div>
    );
  }
};
