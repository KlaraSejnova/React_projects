import React from "react";
import logo from "./logo.svg";
import "./App.css";
import clickable from "./function/clickableFunction";

function App() {
  return (
    <div className="App">
      <header className="App-header" onClick={clickable}>
        <h1>Portfolio Klára Šejnová</h1>
      </header>
    </div>
  );
}

export default App;
