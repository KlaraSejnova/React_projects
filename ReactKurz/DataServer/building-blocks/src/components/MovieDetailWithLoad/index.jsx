import { useEffect, useState } from "react";
import "./style.css";

export const MovieDetailWithLoad = ({ opened, id }) => {
  const [movieDetail, setMovieDetail] = useState();
  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`http://localhost:3000/movie-details/${id}`);
      const data = await response.json();
      setMovieDetail(data);
    };
    if (opened) {
      loadData();
    }
  }, [opened]);
  if (!opened) {
    return null;
  }
  if (!movieDetail) {
    return null;
  } else {
    return (
      <div className="detail-container">
        <img src={movieDetail.thumbnail} alt="movie-img" />
        <div>{movieDetail.extract}</div>
      </div>
    );
  }
};
