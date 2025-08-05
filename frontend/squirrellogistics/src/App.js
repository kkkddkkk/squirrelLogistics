
// App.js
import { Routes, Route, RouterProvider } from "react-router-dom";
import root from "./routes/root";

function App() {
  return (
    <RouterProvider router={root}></RouterProvider>
  );
};

export default App;