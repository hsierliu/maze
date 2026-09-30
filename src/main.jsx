import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainApp1 from "./MainApp1.jsx";
import MainApp2 from "./MainApp2.jsx";
import Login from "./Login.jsx";
import Instructions from "./Instructions.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/instructions/:sessionId/:role" element={<Instructions />} />
      <Route path="/participant1/:sessionId" element={<MainApp1 />} />
      <Route path="/participant2/:sessionId" element={<MainApp2 />} />
    </Routes>
  </BrowserRouter>
);
