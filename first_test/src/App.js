import './App.css';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const checklist = [{name:"rohlik"},{name:"mleko"},{name:"maslo"}]
  const initiallist = ["rohlik","mleko","maslo"]
  const [list, setList] = React.useState(initiallist);
  const [name, setName] = React.useState('');
  console.log(checklist)
  function handleChange(event){ 
    setName(event.target.value);}
  function addItem(){
    const newList = list.concat({ name, id: uuidv4() });

    setList(newList);

    setName('');
  }
  return (
    <div className="App">
      <h1>Seznam nákupu</h1>
      {checklist.map((item,index)=>( <div key={index}>
     <input value={item.name} type="checkbox" />
     <label>{item.name}</label>
   </div>))}
   <input type="text" id="userInput"  placeholder='Add' onChange={handleChange}/>
  <button type='submit' placeholder='Submit' onClick={addItem}>Submit</button>
    </div>
  );
}

export default App;
