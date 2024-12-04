import "./style.css";

export const MovieDetail = ({ extract, image, opened }) => {
  if (!opened) {
    return null;
  } else {
    return (
      <div className="detail-container">
        <img src={image} alt="movie-img" />
        <div>{extract}</div>
      </div>
    );
  }
};
