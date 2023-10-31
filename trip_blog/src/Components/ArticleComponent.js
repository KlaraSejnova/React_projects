import articles from "../articles.json";
import React from "react";
import "../Style/articles.css";

function ArticleComponent() {
  const [articleData, setArticleState] = React.useState(articles);
  return (
    <div className="trips">
      {articleData &&
        articleData.map(({ name, id, text, src }) => (
          <div className="trip grow ">
            <div className="image">
              <img className="shadow" src={src} alt={name} />
            </div>
            <div className="text">
              <h1 id={id}>{name}</h1>
              <section id={id}>{text}</section>
            </div>
          </div>
        ))}
    </div>
  );
}
export default ArticleComponent;
