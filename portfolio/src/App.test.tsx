import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

test("opens the projects page from the home navigation", () => {
  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Projects" }));

  expect(
    screen.getByRole("heading", { name: "Týdenní plánovač" }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Aplikace pro moje dcery/i)).toBeInTheDocument();
});
