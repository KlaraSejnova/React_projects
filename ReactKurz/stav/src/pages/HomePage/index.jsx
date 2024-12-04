import "./style.css";
import { useState } from "react";

export const HomePage = () => {
  const [pocet, setPocet] = useState(0);
  const [jmeno, setJmeno] = useState("Alena");
  const [seznam, setSeznam] = useState([1, 2, 3, 4, 5]);
  const [seen, setSeen] = useState(false);

  const upClick = () => {
    setPocet(pocet + 1);
  };
  const downClick = () => {
    setPocet(pocet - 1);
  };
  const resetClick = () => {
    setPocet(0);
  };
  const addNumber = () => {
    const nahoda = Math.floor(Math.random() * 10 + 1);
    setSeznam([...seznam.concat(nahoda)]);
  };

  return (
    <div className="container">
      <h1
        onClick={() => {
          setJmeno("Petr");
        }}
      >
        Stav: {pocet}, {jmeno}
      </h1>
      <button onClick={upClick}>+</button>
      <button onClick={resetClick}>Reset</button>
      <button onClick={downClick}>-</button>
      <button onClick={addNumber}>Pridej cislo</button>
      <ul>
        {seznam.map((item) => (
          <li>{item}</li>
        ))}
      </ul>
      <hr></hr>
      <button
        onClick={() => {
          seen == false ? setSeen(true) : setSeen(false);
        }}
      >
        {seen ? "hide" : "show"}
      </button>
      {seen && (
        <div>
          <p>Super tajsne</p>
        </div>
      )}
    </div>
  );
};
