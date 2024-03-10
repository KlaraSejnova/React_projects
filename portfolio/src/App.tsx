import "./App.css";
import Navigation from "./components/navigation";
import startPortfolio from "./function/startPorfolioFunciton";

function App() {
  return (
    <div className="App">
      <header className="App-header" onClick={startPortfolio}>
        <h1>Portfolio Klára Šejnová</h1>
        <Navigation></Navigation>
      </header>
    </div>
  );
}

export default App;
