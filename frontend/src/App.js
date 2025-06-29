import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {

    fetch("http://localhost:4000/check", {
      credentials: "include"
    })
      .then(res => setLoggedIn(res.ok));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          loggedIn ? <Navigate to="/" /> : <LoginPage onLogin={() => setLoggedIn(true)} />
        } />
        <Route path="/register" element={
          loggedIn ? <Navigate to="/" /> : <RegisterPage />
        } />
        <Route path="/" element={
          loggedIn ? <HomePage /> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}
