import { useState } from "react";
import "./Select.css";

export const Select = ({ items, selectedItem, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const title = items.find((item) => item.value === selectedItem).label;

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}>
        {title || "Select item"}
      </button>
      {isOpen && (
        <ul>
          {items.map((item) => (
            <li
              key={item.value}
              className={item.value === selectedItem ? "selected" : ""}
              onClick={() => {
                setIsOpen(false);
                if (typeof onSelect === "function") {
                  onSelect(item.value);
                }
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
