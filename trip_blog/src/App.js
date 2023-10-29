import "./App.css";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Home from "./Home";
import About from "./About";
import Trips from "./Trips";
import NavbarCompoment from "./NavbarComponent";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header>Rodinné výlety</header>
      <BrowserRouter>
        <NavbarCompoment />{" "}
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/about" element={<About />} />
          <Route exact path="/trips" element={<Trips />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
