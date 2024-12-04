import { GeistProvider, CssBaseline } from "@geist-ui/core";
import {
  Button,
  Page,
  Text,
  Card,
  Image,
  Link,
  Toggle,
  Spacer,
} from "@geist-ui/core";
import data from "./data.json";
import "./index.css";
import { useState } from "react";

export default () => (
  <GeistProvider>
    <CssBaseline />
    <AppComponent />
  </GeistProvider>
);
export const HomePage = () => {
  const [on, setOn] = useState(false);
  const clickHandler = () => {
    on ? setOn(false) : setOn(true);
  };
  return (
    <>
      <Page>
        <Text h1>Home Page</Text>
        <>
          <Toggle onChange={clickHandler} />
          <Spacer></Spacer>
        </>
        {on ? (
          <div className="div-block">
            {data.map((i) => (
              <Card width="400px" key={i.id}>
                <Image
                  src={i.src}
                  height="200px"
                  width="400px"
                  draggable={false}
                />
                <Text h4 mb={0}>
                  {i.title}
                </Text>
                <Text type="secondary" small>
                  {i.content}
                </Text>
                <Card.Footer>
                  <Link
                    block
                    target="_blank"
                    href="https://github.com/geist-org/geist-ui"
                  >
                    {i.link}
                  </Link>
                </Card.Footer>
              </Card>
            ))}
          </div>
        ) : (
          <></>
        )}
      </Page>
    </>
  );
};
