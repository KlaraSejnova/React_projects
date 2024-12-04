import { Header } from "../../components/Header/Header";
import { Inbox } from "../../components/Inbox/Inbox";
import "./style.css";

export const HomePage = () => {
  return (
    <div className="container">
      <Header user="k.sejnova"></Header>
      <Header></Header>
      <Inbox account="k.sejnova@gmail.com" messages={5} />
      <Inbox account="k.sejnova@gmail.com" messages={0} />
    </div>
  );
};
