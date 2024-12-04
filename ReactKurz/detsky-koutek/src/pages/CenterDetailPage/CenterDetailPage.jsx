import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CenterDetail.css";

export const CenterDetailPage = () => {
  const [name, setName] = useState("");
  const [open, setOpen] = useState("");
  const { centerId } = useParams();

  useEffect(() => {
    const fetchName = async () => {
      const response = await fetch("http://localhost:4000/api/centers");
      const data = await response.json();
      const centerData = data.data.find((inv) => inv.id === Number(centerId));
      setName(centerData);
      setOpen(centerData.open);
    };

    fetchName();
  }, [name]);
  return (
    <div className="container-detail">
      <h1 className="header-center-detail">{name.name}</h1>
      <div className="nameday">
        <b>Adresa: </b>
        {name.address}
      </div>
      <div>
        <b>Kapacita:</b> {name.capacity}
      </div>
      <div>
        <b>Otevírací doba:</b>
        <ul>
          <li>Pondělí: {open.mon}</li>
          <li>Úterý: {open.tue}</li>
          <li>Středa: {open.wed}</li>
          <li>Čtvrtek: {open.thu}</li>
          <li>Pátek: {open.fri}</li>
        </ul>
      </div>
      <div>
        <b>Info:</b> {name.info}
      </div>
    </div>
  );
};
