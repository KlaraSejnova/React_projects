import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Výchozí test vygenerovaný Create React App - ověřuje, že se App vykreslí.
// Pozn.: hledaný text "learn react" je pozůstatek šablony a v aktuální App.tsx se nevyskytuje.
test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
