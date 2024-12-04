import { useState, useEffect } from "react";
import "./style.css";

export const HomePage = () => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("2021-10-12");

  const loadData = async () => {
    console.log(date.split("-"));
    const [y, m, d] = date.split("-");
    const res = await fetch(
      `https://nameday.abalin.net/api/V1/getdate?day=${d}&month=${m}`
    );
    const data = await res.json();
    setName(data.nameday.cz);
  };

  useEffect(() => {
    loadData();
  }, [date]);

  return (
    <div className="container">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      ></input>
      <div>Svatek ma {name}</div>
    </div>
  );
};
