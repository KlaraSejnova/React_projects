
import {Routes, Route} from 'react-router-dom'
import Home from "./routes/home/home.component";
import Navigation from './routes/Navigation/navigation.component';



const Shop = () => {
  return (
    <h1>I am Shop</h1>
  )
}

const App = () => {
  return (
  <Routes>
    <Route path='/' element={<Navigation />}>

    <Route index element={<Home />} />
    <Route path='shop' element={<Shop />} />
    </Route>
   </Routes>
   )
};

export default App;
