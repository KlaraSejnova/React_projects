import "./App.css";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import Home from "./Components/Home";
import About from "./Components/About";
import Trips from "./Components/Trips";
import NavbarCompoment from "./Components/NavbarComponent";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <header>Rodinné výlety</header>
      <BrowserRouter>
        <NavbarCompoment /> <div className="line"></div>
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
