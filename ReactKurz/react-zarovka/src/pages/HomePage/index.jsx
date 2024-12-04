import { Bulb } from "../../components/Bulb/Bulb";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="container">
      <Bulb on={true} />
      <Bulb on={false} />
      <Bulb on={true} />
      <Bulb on={false} />
    </div>
  );
};
