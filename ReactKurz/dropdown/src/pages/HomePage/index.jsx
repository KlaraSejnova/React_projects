import { useState } from "react";
import { Select } from "../../components/Select";
import "./style.css";

const cities = [
  { value: "1", label: "Praha" },
  { value: "2", label: "Brno" },
  { value: "3", label: "Ostrava" },
];
export const HomePage = () => {
  const [city, setCity] = useState("1");
  return (
    <div className="container">
      <Select
        items={cities}
        selectedItem={city}
        onSelect={(value) => {
          setCity(value);
        }}
      ></Select>
    </div>
  );
};
