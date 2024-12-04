import "./style.css";

export const HomePage = () => {
  const handleClick = (e) => {
    console.log(e);
  };
  const handleMouseOver = () => {
    console.log("je na me mys");
  };
  return (
    <div className="container">
      <h1>Udalosti</h1>
      <button onClick={handleClick}>Klikni Na me</button>
      <button
        onMouseOver={handleMouseOver}
        onMouseOut={() => {
          console.log("je pryc");
        }}
      >
        prejet mysi
      </button>
    </div>
  );
};
