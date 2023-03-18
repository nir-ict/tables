import React from "react";
import "./App.css";
import { DndProvider } from "react-dnd";
import MyTable from "./main";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <MyTable />
    </DndProvider>
  );
}

export default App;
