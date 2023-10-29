import articles from "../articles.json";
import React from "react";
import "../Style/articles.css";

function ArticleComponent() {
  const [articleData, setArticleState] = React.useState(articles);
  return (
    <div className="trips">
      {articleData &&
        articleData.map(({ name, id, text }) => (
          <div className="trip grow ">
            <h1 id={id}>{name}</h1>
            <section id={id}>{text}</section>
          </div>
        ))}
    </div>
  );
}
export default ArticleComponent;
