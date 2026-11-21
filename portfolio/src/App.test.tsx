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
  expect(
    screen.getByRole("heading", { name: "Běžecký deník" }),
  ).toBeInTheDocument();
  expect(
    screen.getByAltText(/vrstevnicová mapa s trasou/),
  ).toHaveAttribute(
    "src",
    `${process.env.PUBLIC_URL}/bezecky-denik-preview.png`,
  );
  expect(
    screen.getByAltText(/Každý kilometr se počítá/),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Otevřít běžecký deník" })).toHaveAttribute(
    "href",
    "https://bezeckydenik.netlify.app",
  );
});
