import { useState } from "react";
import "./CollapseBox.css";

export const CollapseBox = ({ title, children }) => {
  const [on, setOn] = useState(false);
  const clickHandler = () => {
    on ? setOn(false) : setOn(true);
  };

  return (
    <>
      <h1 onClick={clickHandler} className="titleBlock">
        {title}
      </h1>
      {on ? <div className="childrenBlock">{children}</div> : <></>}
    </>
  );
};
