import { useEffect, useState } from "react";
import { MovieSimple } from "../MovieSimple";

export const MovieList = () => {
  const [movies, setMovies] = useState([]);
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch("http://localhost:3000/movies/");
      const data = await response.json();

      setMovies(data);
    };
    loadData();
  }, []);

  return (
    <div className="movies-list">
      {movies.map((movie) => (
        <MovieSimple movie={movie} key={movie.id}></MovieSimple>
      ))}
    </div>
  );
};
