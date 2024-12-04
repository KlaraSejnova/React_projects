import { createRoot } from "react-dom/client";
import "./global.css";
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { AboutPage } from "./pages/AboutPage/AboutPage";
import { ContactPage } from "./pages/ContactPage/ContactPage";
import { HomePage } from "./pages/HomePage";
import { ErrorPage } from "./pages/ErrorPage";
import { CentersPage } from "./pages/CentersPage/CentersPage";
import { CenterDetailPage } from "./pages/CenterDetailPage/CenterDetailPage";

export const App = () => {
  return (
    <div className="container main">
      <header>Dětský koutek</header>
      <nav className="nav-main">
        <Link to="/">Home</Link>
        <Link to="/aboutpage">About</Link>
        <Link to="/contactpage">Contact</Link>
        <Link to="/centerspage">Centers</Link>
      </nav>
      <Outlet />
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/aboutpage",
        element: <AboutPage />,
      },
      {
        path: "/contactpage",
        element: <ContactPage />,
      },
      {
        path: "/centerspage",
        element: <CentersPage />,
        children: [
          {
            path: "/centerspage/centerpage/:centerId",
            element: <CenterDetailPage />,
          },
        ],
      },
    ],
  },
]);
createRoot(document.querySelector("#app")).render(
  <RouterProvider router={router} />
);
