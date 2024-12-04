import "./style.css";
import Plushy from "../../components/Plushy/Plushy";

export const HomePage = () => {
  const plushy1 = {
    name: "alex",
    image:
      "https://kodim.cz/cms/assets/czechitas/react1/lekce/uvod-do-reactu/cv-prvni-aplikace/plysaci/elephant.jpg",
    text: "Silvestr rád pozoruje dění za oknem a upřímně se usmívá na všechno kolemjdoucí.",
  };

  const plushy2 = {
    name: " Marty",
    image:
      "https://kodim.cz/cms/assets/czechitas/react1/lekce/uvod-do-reactu/cv-prvni-aplikace/plysaci/mouse.jpg",
    text: "Ctirad tráví svůj čas v blízkosti lednice a s očekáváním pozoruje její bílé dveře.",
  };
  return (
    <>
      {" "}
      <h1 className="container">Plyšáci</h1>
      <div className="plushies">
        <Plushy
          name={plushy1.name}
          image={plushy1.image}
          text={plushy1.text}
        ></Plushy>
        <Plushy
          name={plushy2.name}
          image={plushy2.image}
          text={plushy2.text}
        ></Plushy>
      </div>
    </>
  );
};
