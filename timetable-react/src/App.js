import DaysContainerItem from "./components/daysContainer.component";
import SignIn from "./components/sign-in.component";

function App() {
  return (
    <div className="App pt-10 desktop:px-60 laptop:px-40 tablet:px-20 tablet2:px-10">
      <DaysContainerItem></DaysContainerItem>
      <SignIn></SignIn>
    </div>
  );
}

export default App;
