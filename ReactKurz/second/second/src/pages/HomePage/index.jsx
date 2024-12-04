import "./style.css";

const password = prompt("Zadejte heslo:");
let valid = null;
password.length > 8
  ? (valid = "Heslo je v pořádku")
  : (valid = "Heslo není bezpečné");
const grade = prompt("Počet bodů z písemky:");
let passed = null;

export const HomePage = () => {
  const age = 19;
  return (
    <div className="container">
      <p>Vek uzivatele je {age}</p>
      <p>Uzivatel je {age > 18 ? "dospely" : "dite"}</p>
      {age > 18 ? <h3>{5}</h3> : <h3>limo</h3>}
      <p>{valid}</p>
      {grade >= 50
        ? (passed = "<span>prošel</span>")
        : (passed = '<span class="red">neprošel</span>')}
    </div>
  );
};
