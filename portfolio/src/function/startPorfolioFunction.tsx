// Spustí úvodní animaci: přesune nadpis, změní text na jméno a ukáže navigaci.
const startPorfolio = (event: any) => {
  const div = document.getElementsByTagName("h1")[0];
  const head = document.getElementsByTagName("header")[0];
  const nav = document.getElementsByClassName("container-navigation")[0];

  // Třída clickStart přepne CSS animaci hlavičky z úvodního stavu do zobrazení obsahu.
  head.classList.add("clickStart");
  if (nav) {
    nav.classList.add("show");
  }

  div.innerHTML = "Klára Šejnová";
};
export default startPorfolio;
