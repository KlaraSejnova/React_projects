import { createRoot } from "react-dom/client";
import { HomePage } from "./pages/HomePage";
import "./global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ExpensesPage } from "./pages/ExpensesPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage></HomePage> },
  { path: "/invoices", element: <InvoicesPage></InvoicesPage> },
  { path: "/expenses", element: <ExpensesPage></ExpensesPage> },
]);
createRoot(document.querySelector("#app")).render(
  <RouterProvider router={router}></RouterProvider>
);
