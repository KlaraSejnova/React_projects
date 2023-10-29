import { LoremIpsum } from "react-lorem-ipsum";
import "../Style/about.css";
function About() {
  return (
    <div className="about">
      <h2>About Us</h2>
      <LoremIpsum p={2} />
    </div>
  );
}

export default About;
