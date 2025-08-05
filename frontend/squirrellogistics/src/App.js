// App.js
import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import RegisterPage from "./pages/Layout/RegisterPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
};

export default App;