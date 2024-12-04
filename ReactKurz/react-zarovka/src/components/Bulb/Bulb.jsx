import "./bulb.css";

export const Bulb = (props) => {
  const { on } = props;
  const classname = on ? "bulb bulb--on" : "bulb";
  return (
    <>
      <div className={classname}></div>
    </>
  );
};
