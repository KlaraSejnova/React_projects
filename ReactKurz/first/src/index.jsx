import { createRoot } from "react-dom/client";
import "./global.css";
import { HomePage } from "./pages/HomePage";

const content = <HomePage />;

createRoot(document.querySelector("#app")).render(<>{content}</>);
