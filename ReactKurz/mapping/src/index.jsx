import { createRoot } from "react-dom/client";
import "./global.css";
import list from "./products";
import { ProduceList } from "./ProductList";

const names = ["petr", "pavel"];

createRoot(document.querySelector("#app")).render(
  <ProduceList list={list}></ProduceList>
);
