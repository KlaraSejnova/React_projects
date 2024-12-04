import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./CentersPage.css";

export const CentersPage = () => {
  const [name, setName] = useState([]);

  useEffect(() => {
    const fetchName = async () => {
      const response = await fetch("http://localhost:4000/api/centers");
      const data = await response.json();
      setName(data.data);
    };

    fetchName();
  }, []);
  return (
    <div className="container">
      <h1>Centers</h1>
      <nav className="nav-centers">
        {name.map((i) => (
          <Link key={i.id} to={`/centerspage/centerpage/${i.id}`}>
            {i.name}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
};
