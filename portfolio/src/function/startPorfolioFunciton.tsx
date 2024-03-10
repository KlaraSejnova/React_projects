const startPorfolio = (event: any) => {
  const div = document.getElementsByTagName("h1")[0];
  const head = document.getElementsByTagName("header")[0];
  const nav = document.getElementsByClassName("container-navigation")[0];

  head.classList.add("clickStart");
  if (nav) {
    nav.classList.add("show");
  }

  div.innerHTML = "Klára Šejnová";
};
export default startPorfolio;
