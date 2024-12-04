import { CollapseBox } from "../../components/CollapseBox/CollapseBox";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="container">
      <main>
        <CollapseBox title="Podrobnosti">
          <h2>Lorem ipsum dolor sit amet</h2>
          <p>
            Consectetuer adipiscing elit. Fusce nibh. In laoreet, magna id
            viverra tincidunt.
          </p>
        </CollapseBox>
      </main>
    </div>
  );
};
